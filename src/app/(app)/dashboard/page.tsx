import type { Metadata } from "next";
import { and, count, eq, isNull } from "drizzle-orm";
import AppointmentList from "@/components/appointments/AppointmentList";
import FlipLink from "@/components/ui/FlipLink";
import { db, notifications } from "@/db";
import { requireUser } from "@/lib/auth";
import { listAppointments } from "@/lib/appointments";
import { localDate } from "@/lib/time";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [upcoming, past, [unread]] = await Promise.all([
    listAppointments(user, "upcoming"),
    listAppointments(user, "past", 10),
    db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt))),
  ]);

  const tz = user.provider?.timezone ?? "UTC";
  const today = localDate(new Date(), tz);
  const todayCount = upcoming.filter((i) => localDate(i.appointment.startsAt, i.timezone) === today).length;

  return (
    <>
      <div className="page-title">
        <h1>Hello, {user.name.split(" ")[0]}</h1>
        <p>{user.role === "provider" ? user.provider?.businessName : "Your appointments at a glance"}</p>
      </div>

      <div className="stat-grid">
        <div className="stat glass"><strong>{upcoming.length}</strong><span>Upcoming</span></div>
        {user.role === "provider" && (
          <div className="stat glass"><strong>{todayCount}</strong><span>Today</span></div>
        )}
        <div className="stat glass"><strong>{unread?.value ?? 0}</strong><span>Unread alerts</span></div>
      </div>

      <section className="panel glass">
        <div className="row row--between">
          <h2>Upcoming appointments</h2>
          {user.role === "client" ? (
            <FlipLink href="/providers" label="Book new" variant="alt" />
          ) : (
            <FlipLink href="/dashboard/services" label="Services" variant="alt" />
          )}
        </div>
        <AppointmentList
          items={upcoming}
          viewer={user.role}
          empty={user.role === "client" ? "Nothing booked yet. Find a provider to get started." : "No upcoming appointments."}
        />
      </section>

      <section className="panel glass">
        <h2>History</h2>
        <AppointmentList items={past} viewer={user.role} empty="No past appointments yet." />
      </section>
    </>
  );
}
