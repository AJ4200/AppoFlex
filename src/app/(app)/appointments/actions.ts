"use server";

import { and, asc, eq, gt, inArray, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appointments, db, messages, providers, services, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { ACTIVE_STATUSES, findNextAvailable, getAvailableSlots, isOverlapError } from "@/lib/scheduling";
import { formatDateTime } from "@/lib/time";

export type AppointmentState = { error?: string; success?: string };

const uuid = z.string().uuid();

async function loadAppointment(id: string) {
  if (!uuid.safeParse(id).success) return null;
  const [row] = await db
    .select({
      appointment: appointments,
      service: services,
      provider: providers,
      client: { id: users.id, name: users.name },
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(providers, eq(providers.userId, appointments.providerId))
    .innerJoin(users, eq(users.id, appointments.clientId))
    .where(eq(appointments.id, id))
    .limit(1);
  return row ?? null;
}

type Loaded = NonNullable<Awaited<ReturnType<typeof loadAppointment>>>;

/** Loads an appointment and verifies the signed-in user is one of its two parties */
async function loadForParticipant(id: string) {
  const user = await requireUser();
  const row = await loadAppointment(id);
  if (!row) return null;
  const isProvider = row.appointment.providerId === user.id;
  const isClient = row.appointment.clientId === user.id;
  if (!isProvider && !isClient) return null;
  return { user, row, isProvider };
}

function otherPartyId(row: Loaded, isProvider: boolean) {
  return isProvider ? row.appointment.clientId : row.appointment.providerId;
}

function refresh(id: string) {
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/dashboard");
}

const bookSchema = z.object({
  providerId: uuid,
  serviceId: uuid,
  startsAt: z.string().datetime({ message: "Pick a time slot" }),
  notes: z.string().trim().max(500).default(""),
});

export async function bookAppointmentAction(
  _prev: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const user = await requireUser("client");
  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { providerId, serviceId, startsAt, notes } = parsed.data;

  const [provider] = await db.select().from(providers).where(eq(providers.userId, providerId)).limit(1);
  if (!provider) return { error: "That provider no longer exists." };

  const start = new Date(startsAt);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: provider.timezone }).format(start);
  const slots = await getAvailableSlots({ providerId, serviceId, date });
  const slot = slots.find((s) => s.startsAt === start.toISOString());
  if (!slot) return { error: "That time is no longer available. Please pick another slot." };

  let id: string;
  try {
    [{ id }] = await db
      .insert(appointments)
      .values({ providerId, serviceId, clientId: user.id, startsAt: start, endsAt: new Date(slot.endsAt), notes })
      .returning({ id: appointments.id });
  } catch (error) {
    if (isOverlapError(error)) return { error: "Someone just booked that time. Please pick another slot." };
    throw error;
  }

  await notify(providerId, {
    title: "New appointment",
    body: `${user.name} booked ${formatDateTime(start, provider.timezone)}.`,
    href: `/appointments/${id}`,
  });
  revalidatePath("/dashboard");
  redirect(`/appointments/${id}`);
}

export async function cancelAppointmentAction(formData: FormData) {
  const ctx = await loadForParticipant(String(formData.get("id") ?? ""));
  if (!ctx) return;
  const { row, user, isProvider } = ctx;
  if (!ACTIVE_STATUSES.includes(row.appointment.status as (typeof ACTIVE_STATUSES)[number])) return;

  await db
    .update(appointments)
    .set({ status: "cancelled", delayMinutes: 0, overrunMinutes: 0 })
    .where(eq(appointments.id, row.appointment.id));

  await notify(otherPartyId(row, isProvider), {
    title: "Appointment cancelled",
    body: `${user.name} cancelled ${row.service.name} on ${formatDateTime(row.appointment.startsAt, row.provider.timezone)}.`,
    href: `/appointments/${row.appointment.id}`,
  });
  await recalculateDelays(row.appointment.providerId);
  refresh(row.appointment.id);
}

export async function rescheduleAppointmentAction(
  _prev: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const ctx = await loadForParticipant(String(formData.get("id") ?? ""));
  if (!ctx) return { error: "Appointment not found." };
  const { row, user, isProvider } = ctx;
  const { appointment, provider, service } = row;
  if (!ACTIVE_STATUSES.includes(appointment.status as (typeof ACTIVE_STATUSES)[number])) {
    return { error: "This appointment can no longer be changed." };
  }

  const parsed = z.string().datetime({ message: "Pick a new time slot" }).safeParse(formData.get("startsAt"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const start = new Date(parsed.data);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: provider.timezone }).format(start);
  const slots = await getAvailableSlots({
    providerId: appointment.providerId,
    serviceId: appointment.serviceId,
    date,
    ignoreAppointmentId: appointment.id,
  });
  const slot = slots.find((s) => s.startsAt === start.toISOString());
  if (!slot) return { error: "That time is not available. Please pick another slot." };

  try {
    await db
      .update(appointments)
      .set({ startsAt: start, endsAt: new Date(slot.endsAt), delayMinutes: 0, overrunMinutes: 0, status: "scheduled" })
      .where(eq(appointments.id, appointment.id));
  } catch (error) {
    if (isOverlapError(error)) return { error: "Someone just booked that time. Please pick another slot." };
    throw error;
  }

  await notify(otherPartyId(row, isProvider), {
    title: "Appointment rescheduled",
    body: `${user.name} moved ${service.name} to ${formatDateTime(start, provider.timezone)}.`,
    href: `/appointments/${appointment.id}`,
  });
  await recalculateDelays(appointment.providerId);
  refresh(appointment.id);
  return { success: "Appointment rescheduled." };
}

const statusSchema = z.enum(["in_progress", "completed", "no_show"]);

export async function updateStatusAction(formData: FormData) {
  const ctx = await loadForParticipant(String(formData.get("id") ?? ""));
  const status = statusSchema.safeParse(formData.get("status"));
  if (!ctx || !ctx.isProvider || !status.success) return;
  const { appointment, service } = ctx.row;
  if (!ACTIVE_STATUSES.includes(appointment.status as (typeof ACTIVE_STATUSES)[number])) return;

  await db
    .update(appointments)
    .set({ status: status.data, ...(status.data === "in_progress" ? {} : { delayMinutes: 0, overrunMinutes: 0 }) })
    .where(eq(appointments.id, appointment.id));

  if (status.data === "completed") {
    await notify(appointment.clientId, {
      title: "Appointment completed",
      body: `Thanks for visiting ${ctx.row.provider.businessName} for ${service.name}.`,
      href: `/appointments/${appointment.id}`,
    });
  }
  await recalculateDelays(appointment.providerId);
  refresh(appointment.id);
}

/** Provider says an appointment is running over; everyone after it is told and offered a new slot */
export async function reportDelayAction(formData: FormData) {
  const ctx = await loadForParticipant(String(formData.get("id") ?? ""));
  if (!ctx || !ctx.isProvider) return;
  const minutes = z.coerce.number().int().min(0).max(240).safeParse(formData.get("minutes"));
  if (!minutes.success) return;
  const { appointment } = ctx.row;
  if (!ACTIVE_STATUSES.includes(appointment.status as (typeof ACTIVE_STATUSES)[number])) return;

  await db.update(appointments).set({ overrunMinutes: minutes.data }).where(eq(appointments.id, appointment.id));
  await recalculateDelays(appointment.providerId);
  refresh(appointment.id);
}

/**
 * Walks the provider's upcoming appointments in order and works out how late each one
 * will start given the minutes earlier appointments are running over. Clients whose
 * expected start changed are notified and offered the next free slot.
 */
async function recalculateDelays(providerId: string) {
  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 3_600_000);
  const upcoming = await db
    .select({ appointment: appointments, service: services, provider: providers })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(providers, eq(providers.userId, appointments.providerId))
    .where(
      and(
        eq(appointments.providerId, providerId),
        inArray(appointments.status, [...ACTIVE_STATUSES]),
        lt(appointments.startsAt, horizon),
        gt(appointments.endsAt, new Date(now.getTime() - 12 * 3_600_000)),
      ),
    )
    .orderBy(asc(appointments.startsAt));

  let runningEnd = 0;
  for (const { appointment, service, provider } of upcoming) {
    const planned = appointment.startsAt.getTime();
    const expectedStart = Math.max(planned, runningEnd);
    const delay = Math.round((expectedStart - planned) / 60_000);
    runningEnd =
      expectedStart + (appointment.endsAt.getTime() - planned) + appointment.overrunMinutes * 60_000;

    if (delay === appointment.delayMinutes) continue;
    await db.update(appointments).set({ delayMinutes: delay }).where(eq(appointments.id, appointment.id));

    if (delay > 0) {
      const next = await findNextAvailable(providerId, appointment.serviceId);
      const suggestion = next
        ? ` The next free slot is ${formatDateTime(new Date(next.startsAt), provider.timezone)} if you would rather move.`
        : "";
      await notify(appointment.clientId, {
        title: `Running about ${delay} min late`,
        body: `${provider.businessName} is running behind, so your ${service.name} may start around ${formatDateTime(new Date(expectedStart), provider.timezone)}.${suggestion}`,
        href: `/appointments/${appointment.id}`,
      });
    } else if (appointment.delayMinutes > 0) {
      await notify(appointment.clientId, {
        title: "Back on schedule",
        body: `Your ${service.name} will start at the planned time.`,
        href: `/appointments/${appointment.id}`,
      });
    }
  }
}

export async function sendMessageAction(_prev: AppointmentState, formData: FormData): Promise<AppointmentState> {
  const ctx = await loadForParticipant(String(formData.get("id") ?? ""));
  if (!ctx) return { error: "Appointment not found." };
  const body = z.string().trim().min(1, "Write a message first").max(1000).safeParse(formData.get("body"));
  if (!body.success) return { error: body.error.issues[0].message };

  const { appointment } = ctx.row;
  await db.insert(messages).values({ appointmentId: appointment.id, senderId: ctx.user.id, body: body.data });
  await notify(otherPartyId(ctx.row, ctx.isProvider), {
    title: `New message from ${ctx.user.name}`,
    body: body.data.slice(0, 120),
    href: `/appointments/${appointment.id}`,
  });
  revalidatePath(`/appointments/${appointment.id}`);
  return { success: "Sent" };
}
