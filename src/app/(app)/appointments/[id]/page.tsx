import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import MessageComposer from "@/components/appointments/MessageComposer";
import RescheduleForm from "@/components/appointments/RescheduleForm";
import StatusBadge from "@/components/appointments/StatusBadge";
import { appointments, db, messages, providers, services, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { ACTIVE_STATUSES } from "@/lib/scheduling";
import { formatDateTime, formatPrice, formatTime } from "@/lib/time";
import { cancelAppointmentAction, reportDelayAction, updateStatusAction } from "../actions";

export const metadata: Metadata = { title: "Appointment" };

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [row] = await db
    .select({
      appointment: appointments,
      service: services,
      provider: providers,
      client: { id: users.id, name: users.name, email: users.email },
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .innerJoin(providers, eq(providers.userId, appointments.providerId))
    .innerJoin(users, eq(users.id, appointments.clientId))
    .where(eq(appointments.id, id))
    .limit(1);

  if (!row || (row.appointment.providerId !== user.id && row.appointment.clientId !== user.id)) notFound();

  const { appointment: a, service, provider, client } = row;
  const isProvider = a.providerId === user.id;
  const tz = provider.timezone;
  const active = ACTIVE_STATUSES.includes(a.status as (typeof ACTIVE_STATUSES)[number]);

  const thread = await db
    .select({ message: messages, senderName: users.name })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.appointmentId, id))
    .orderBy(asc(messages.createdAt));

  const summary = `${service.name} with ${isProvider ? client.name : provider.businessName} on ${formatDateTime(a.startsAt, tz)}`;

  return (
    <>
      <div className="page-title">
        <div className="row row--between">
          <h1>{service.name}</h1>
          <StatusBadge status={a.status} />
        </div>
        <p>{isProvider ? `Client: ${client.name}` : provider.businessName}</p>
      </div>

      <section className="panel glass">
        <ul className="list">
          <li className="list-item"><span className="muted">When</span><span>{formatDateTime(a.startsAt, tz)} – {formatTime(a.endsAt, tz)}</span></li>
          <li className="list-item"><span className="muted">Duration</span><span>{service.durationMinutes} min</span></li>
          <li className="list-item"><span className="muted">Price</span><span>{formatPrice(service.priceCents)}</span></li>
          {isProvider && <li className="list-item"><span className="muted">Client email</span><span>{client.email}</span></li>}
          {a.notes && <li className="list-item"><span className="muted">Notes</span><span>{a.notes}</span></li>}
        </ul>
        {a.status === "scheduled" && a.delayMinutes > 0 && (
          <p className="timeline-note accent" style={{ marginTop: "1rem" }}>
            Running about {a.delayMinutes} min late. Expected start around{" "}
            {formatTime(new Date(a.startsAt.getTime() + a.delayMinutes * 60_000), tz)}.
          </p>
        )}
        {a.overrunMinutes > 0 && active && (
          <p className="timeline-note accent" style={{ marginTop: "1rem" }}>
            This appointment is running {a.overrunMinutes} min over.
          </p>
        )}
      </section>

      {active && isProvider && (
        <section className="panel glass">
          <h2>Manage</h2>
          <div className="row">
            {a.status === "scheduled" && (
              <form action={updateStatusAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="status" value="in_progress" />
                <button className="btn-confirm btn-confirm--sm">Start</button>
              </form>
            )}
            <form action={updateStatusAction}>
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="status" value="completed" />
              <button className="btn-confirm btn-confirm--sm">Mark completed</button>
            </form>
            <form action={updateStatusAction}>
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="status" value="no_show" />
              <button className="btn-confirm btn-confirm--sm btn-confirm--danger">No show</button>
            </form>
          </div>
          <form action={reportDelayAction} className="row" style={{ marginTop: "1rem" }}>
            <input type="hidden" name="id" value={a.id} />
            <label className="field-label" htmlFor="minutes">Running over by</label>
            <select id="minutes" name="minutes" className="input" style={{ width: "8rem" }} defaultValue={a.overrunMinutes}>
              {[0, 5, 10, 15, 20, 30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>{m === 0 ? "On time" : `${m} min`}</option>
              ))}
            </select>
            <button className="btn-confirm btn-confirm--sm">Update &amp; alert next clients</button>
          </form>
        </section>
      )}

      {active && (
        <>
          <RescheduleForm appointmentId={a.id} providerId={a.providerId} serviceId={a.serviceId} timezone={tz} />
          <form action={cancelAppointmentAction} style={{ marginBottom: "1rem" }}>
            <input type="hidden" name="id" value={a.id} />
            <button className="btn-confirm btn-confirm--sm btn-confirm--danger">Cancel appointment</button>
          </form>
        </>
      )}

      <section className="panel glass">
        <h2>Messages</h2>
        <div className="chat" aria-live="polite">
          {thread.length === 0 && <p className="empty">No messages yet.</p>}
          {thread.map(({ message, senderName }) => (
            <div key={message.id} className={`bubble ${message.senderId === user.id ? "bubble--mine" : ""}`}>
              <small>{message.senderId === user.id ? "You" : senderName} · {formatDateTime(message.createdAt, tz)}</small>
              {message.body}
            </div>
          ))}
        </div>
        <MessageComposer appointmentId={a.id} summary={summary} />
      </section>
    </>
  );
}
