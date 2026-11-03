import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import BookingPanel from "@/components/booking/BookingPanel";
import { db, providers, services } from "@/db";
import { requireUser } from "@/lib/auth";
import { localDate } from "@/lib/time";

export const metadata: Metadata = { title: "Book an appointment" };

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [provider] = await db.select().from(providers).where(eq(providers.userId, id)).limit(1);
  if (!provider) notFound();

  const list = await db
    .select()
    .from(services)
    .where(and(eq(services.providerId, id), eq(services.active, true)))
    .orderBy(asc(services.name));

  return (
    <>
      <div className="page-title">
        <h1>{provider.businessName}</h1>
        <p>
          {provider.businessType}
          {provider.description ? ` · ${provider.description}` : ""}
        </p>
      </div>

      {user.role !== "client" ? (
        <p className="empty glass">Sign in with a client account to book appointments.</p>
      ) : list.length === 0 ? (
        <p className="empty glass">This provider has not added any services yet.</p>
      ) : (
        <BookingPanel
          providerId={id}
          timezone={provider.timezone}
          today={localDate(new Date(), provider.timezone)}
          services={list.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            durationMinutes: s.durationMinutes,
            priceCents: s.priceCents,
          }))}
        />
      )}
    </>
  );
}
