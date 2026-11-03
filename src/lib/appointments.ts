import { and, asc, desc, eq, gte, inArray, lt, or } from "drizzle-orm";
import { appointments, db, providers, services, users } from "@/db";
import type { SessionUser } from "@/lib/auth";
import { ACTIVE_STATUSES } from "@/lib/scheduling";

export type AppointmentListItem = Awaited<ReturnType<typeof listAppointments>>[number];

export async function listAppointments(
  user: SessionUser,
  scope: "upcoming" | "past",
  limit = 50,
) {
  const mine = user.role === "provider" ? eq(appointments.providerId, user.id) : eq(appointments.clientId, user.id);
  const now = new Date();
  // Appointments that are still in progress or running late stay in the upcoming list
  const when =
    scope === "upcoming"
      ? and(inArray(appointments.status, [...ACTIVE_STATUSES]), gte(appointments.endsAt, now))
      : or(lt(appointments.endsAt, now), inArray(appointments.status, ["completed", "cancelled", "no_show"]));

  return db
    .select({
      appointment: appointments,
      service: services,
      timezone: providers.timezone,
      businessName: providers.businessName,
      clientName: users.name,
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(providers, eq(providers.userId, appointments.providerId))
    .innerJoin(users, eq(users.id, appointments.clientId))
    .where(and(mine, when))
    .orderBy(scope === "upcoming" ? asc(appointments.startsAt) : desc(appointments.startsAt))
    .limit(limit);
}
