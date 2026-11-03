import { and, eq, gt, inArray, lt } from "drizzle-orm";
import { appointments, availability, db, providers, services } from "@/db";
import { BOOKING_HORIZON_DAYS, SLOT_STEP_MINUTES } from "@/lib/constants";
import { addDays, isValidDateString, localDate, weekdayOf, zonedToUtc } from "@/lib/time";

export const ACTIVE_STATUSES = ["scheduled", "in_progress"] as const;

export type Slot = { startsAt: string; endsAt: string };

type SlotQuery = {
  providerId: string;
  serviceId: string;
  /** Local date (YYYY-MM-DD) in the provider's timezone */
  date: string;
  /** Appointment to ignore while looking for free time (used when rescheduling) */
  ignoreAppointmentId?: string;
};

export async function getAvailableSlots({
  providerId,
  serviceId,
  date,
  ignoreAppointmentId,
}: SlotQuery): Promise<Slot[]> {
  if (!isValidDateString(date)) return [];

  const [provider] = await db.select().from(providers).where(eq(providers.userId, providerId)).limit(1);
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.providerId, providerId), eq(services.active, true)))
    .limit(1);
  if (!provider || !service) return [];

  const now = new Date();
  const today = localDate(now, provider.timezone);
  if (date < today || date > addDays(today, BOOKING_HORIZON_DAYS)) return [];

  const [hours] = await db
    .select()
    .from(availability)
    .where(and(eq(availability.providerId, providerId), eq(availability.weekday, weekdayOf(date))))
    .limit(1);
  if (!hours) return [];

  const dayStart = zonedToUtc(date, hours.startMinute, provider.timezone);
  const dayEnd = zonedToUtc(date, hours.endMinute, provider.timezone);
  const bufferMs = provider.bufferMinutes * 60_000;
  const durationMs = service.durationMinutes * 60_000;

  const busy = (
    await db
      .select({ id: appointments.id, startsAt: appointments.startsAt, endsAt: appointments.endsAt })
      .from(appointments)
      .where(
        and(
          eq(appointments.providerId, providerId),
          inArray(appointments.status, [...ACTIVE_STATUSES]),
          lt(appointments.startsAt, new Date(dayEnd.getTime() + bufferMs)),
          gt(appointments.endsAt, new Date(dayStart.getTime() - bufferMs)),
        ),
      )
  ).filter((a) => a.id !== ignoreAppointmentId);

  const slots: Slot[] = [];
  const stepMs = SLOT_STEP_MINUTES * 60_000;
  for (let t = dayStart.getTime(); t + durationMs <= dayEnd.getTime(); t += stepMs) {
    const end = t + durationMs;
    if (t <= now.getTime()) continue;
    const clashes = busy.some(
      (a) => t < a.endsAt.getTime() + bufferMs && end > a.startsAt.getTime() - bufferMs,
    );
    if (!clashes) {
      slots.push({ startsAt: new Date(t).toISOString(), endsAt: new Date(end).toISOString() });
    }
  }
  return slots;
}

/** First date with a free slot within the next two weeks, used for "next available" suggestions */
export async function findNextAvailable(providerId: string, serviceId: string, fromDate?: string) {
  const [provider] = await db.select().from(providers).where(eq(providers.userId, providerId)).limit(1);
  if (!provider) return null;
  const start = fromDate ?? localDate(new Date(), provider.timezone);
  for (let i = 0; i < 14; i++) {
    const slots = await getAvailableSlots({ providerId, serviceId, date: addDays(start, i) });
    if (slots.length) return slots[0];
  }
  return null;
}

/** Postgres exclusion violation raised by the appointments_no_overlap constraint */
export function isOverlapError(error: unknown) {
  let current: unknown = error;
  while (current && typeof current === "object") {
    const e = current as { code?: string; message?: string; cause?: unknown };
    if (e.code === "23P01" || e.message?.includes("appointments_no_overlap")) return true;
    current = e.cause;
  }
  return false;
}
