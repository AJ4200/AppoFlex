import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, notifications } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/time";
import { markAllReadAction, markReadAction } from "./actions";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
  const tz = user.provider?.timezone ?? "UTC";
  const hasUnread = items.some((n) => !n.readAt);

  return (
    <>
      <div className="page-title row row--between">
        <div>
          <h1>Notifications</h1>
          <p>Bookings, changes, delays and messages.</p>
        </div>
        {hasUnread && (
          <form action={markAllReadAction}>
            <button className="btn-confirm btn-confirm--sm">Mark all read</button>
          </form>
        )}
      </div>

      <section className="panel glass">
        {items.length === 0 ? (
          <p className="empty">You are all caught up.</p>
        ) : (
          <ul className="list">
            {items.map((n) => (
              <li key={n.id} className={`list-item ${n.readAt ? "" : "list-item--unread"}`}>
                <div>
                  <strong>{n.href ? <Link href={n.href} className="accent">{n.title}</Link> : n.title}</strong>
                  {n.body && <div className="muted">{n.body}</div>}
                  <small className="muted">{formatDateTime(n.createdAt, tz)}</small>
                </div>
                {!n.readAt && (
                  <form action={markReadAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="btn-confirm btn-confirm--sm">Mark read</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
