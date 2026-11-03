import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, providers, services } from "@/db";
import Icon from "@/components/ui/Icon";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Find a provider" };

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;
  const term = q?.trim().slice(0, 60);

  const rows = await db
    .select({
      id: providers.userId,
      businessName: providers.businessName,
      businessType: providers.businessType,
      description: providers.description,
      serviceCount: sql<number>`count(${services.id})::int`,
    })
    .from(providers)
    .innerJoin(services, and(eq(services.providerId, providers.userId), eq(services.active, true)))
    .where(
      term
        ? sql`(${providers.businessName} ilike ${`%${term}%`} or ${providers.businessType} ilike ${`%${term}%`})`
        : undefined,
    )
    .groupBy(providers.userId)
    .orderBy(asc(providers.businessName));

  return (
    <>
      <div className="page-title">
        <h1>Find a provider</h1>
        <p>Choose a business and book a time that works for you.</p>
      </div>

      <form className="row" style={{ marginBottom: "1rem" }} role="search">
        <input className="input" name="q" defaultValue={term} placeholder="Search by name or type" aria-label="Search providers" />
        <button className="btn-confirm btn-confirm--sm">Search</button>
      </form>

      {rows.length === 0 ? (
        <p className="empty glass">No providers found yet.</p>
      ) : (
        <div className="grid">
          {rows.map((p) => (
            <Link key={p.id} href={`/providers/${p.id}`} className="card card--link glass glass--warm">
              <h3>{p.businessName}</h3>
              <span className="badge" style={{ alignSelf: "flex-start" }}>{p.businessType}</span>
              {p.description && <p className="muted">{p.description}</p>}
              <p className="accent">{p.serviceCount} service{p.serviceCount === 1 ? "" : "s"} →</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
