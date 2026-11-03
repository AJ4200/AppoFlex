import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import ServiceForm from "@/components/provider/ServiceForm";
import { db, services } from "@/db";
import { requireProvider } from "@/lib/auth";
import { formatPrice } from "@/lib/time";
import { deleteServiceAction, toggleServiceAction } from "../actions";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const user = await requireProvider();
  const list = await db
    .select()
    .from(services)
    .where(eq(services.providerId, user.id))
    .orderBy(asc(services.name));

  return (
    <>
      <div className="page-title">
        <h1>Your services</h1>
        <p>Each service has its own duration, so appointments never overlap.</p>
      </div>

      <section className="panel glass">
        {list.length === 0 ? (
          <p className="empty">No services yet. Add your first one below.</p>
        ) : (
          <ul className="list">
            {list.map((s) => (
              <li key={s.id} className="list-item">
                <div>
                  <strong>{s.name}</strong> {!s.active && <span className="badge badge--cancelled">Hidden</span>}
                  <div className="muted">
                    {s.durationMinutes} min · {formatPrice(s.priceCents)}
                  </div>
                  {s.description && <div className="muted">{s.description}</div>}
                </div>
                <div className="row">
                  <form action={toggleServiceAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-confirm btn-confirm--sm">{s.active ? "Hide" : "Show"}</button>
                  </form>
                  <form action={deleteServiceAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn-confirm btn-confirm--sm btn-confirm--danger">Delete</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ServiceForm />
    </>
  );
}
