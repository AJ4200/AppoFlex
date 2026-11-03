"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { availability, db, providers, services } from "@/db";
import { requireProvider } from "@/lib/auth";
import { parseTimeInput } from "@/lib/time";

export type ActionState = { error?: string; success?: string };

const serviceSchema = z.object({
  name: z.string().trim().min(2, "Give the service a name").max(80),
  description: z.string().trim().max(500).default(""),
  durationMinutes: z.coerce.number().int().min(5, "Minimum 5 minutes").max(600, "Maximum 10 hours"),
  price: z.coerce.number().min(0, "Price cannot be negative").max(100000),
});

export async function createServiceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireProvider();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(services).values({
    providerId: user.id,
    name: parsed.data.name,
    description: parsed.data.description,
    durationMinutes: parsed.data.durationMinutes,
    priceCents: Math.round(parsed.data.price * 100),
  });
  revalidatePath("/dashboard/services");
  return { success: "Service added" };
}

export async function toggleServiceAction(formData: FormData) {
  const user = await requireProvider();
  const id = String(formData.get("id") ?? "");
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, id), eq(services.providerId, user.id)))
    .limit(1);
  if (!service) return;
  await db.update(services).set({ active: !service.active }).where(eq(services.id, id));
  revalidatePath("/dashboard/services");
}

export async function deleteServiceAction(formData: FormData) {
  const user = await requireProvider();
  const id = String(formData.get("id") ?? "");
  try {
    await db.delete(services).where(and(eq(services.id, id), eq(services.providerId, user.id)));
  } catch {
    // Services that already have appointments are kept for history but hidden from booking
    await db
      .update(services)
      .set({ active: false })
      .where(and(eq(services.id, id), eq(services.providerId, user.id)));
  }
  revalidatePath("/dashboard/services");
}

const profileSchema = z.object({
  businessName: z.string().trim().min(2, "Enter your business name").max(80),
  description: z.string().trim().max(600).default(""),
  bufferMinutes: z.coerce.number().int().min(0).max(120),
});

export async function saveHoursAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireProvider();

  const profile = profileSchema.safeParse(Object.fromEntries(formData));
  if (!profile.success) return { error: profile.error.issues[0].message };

  const rows: { providerId: string; weekday: number; startMinute: number; endMinute: number }[] = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    if (formData.get(`open_${weekday}`) !== "on") continue;
    const start = parseTimeInput(String(formData.get(`start_${weekday}`) ?? ""));
    const end = parseTimeInput(String(formData.get(`end_${weekday}`) ?? ""));
    if (start === null || end === null || end <= start) {
      return { error: "Each open day needs a start time that is before its end time." };
    }
    rows.push({ providerId: user.id, weekday, startMinute: start, endMinute: end });
  }

  await db
    .update(providers)
    .set({
      businessName: profile.data.businessName,
      description: profile.data.description,
      bufferMinutes: profile.data.bufferMinutes,
    })
    .where(eq(providers.userId, user.id));

  await db.delete(availability).where(eq(availability.providerId, user.id));
  if (rows.length) await db.insert(availability).values(rows);

  revalidatePath("/dashboard/hours");
  return { success: "Saved" };
}
