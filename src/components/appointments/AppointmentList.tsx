import Link from "next/link";
import type { AppointmentListItem } from "@/lib/appointments";
import { formatDateTime, formatTime } from "@/lib/time";
import StatusBadge from "./StatusBadge";

export default function AppointmentList({
  items,
  viewer,
  empty,
}: {
  items: AppointmentListItem[];
  viewer: "client" | "provider";
  empty: string;
}) {
  if (items.length === 0) return <p className="empty">{empty}</p>;

  return (
    <ul className="list">
      {items.map(({ appointment: a, service, timezone, businessName, clientName }) => (
        <li key={a.id}>
          <Link href={`/appointments/${a.id}`} className="list-item card--link">
            <div>
              <strong>{service.name}</strong>
              <div className="muted">
                {formatDateTime(a.startsAt, timezone)} – {formatTime(a.endsAt, timezone)} ·{" "}
                {viewer === "provider" ? clientName : businessName}
              </div>
              {a.delayMinutes > 0 && a.status === "scheduled" && (
                <div className="accent">Running about {a.delayMinutes} min late</div>
              )}
            </div>
            <StatusBadge status={a.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
