import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTACT, LEGAL_DOCS, LEGAL_UPDATED, getLegalDoc } from "@/lib/legal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  return { title: doc?.title ?? "Legal" };
}

export default async function LegalPage({ params }: Params) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();

  return (
    <main className="page legal">
      <nav className="legal-tabs" aria-label="Legal documents">
        {LEGAL_DOCS.map((d) => (
          <Link
            key={d.slug}
            href={`/legal/${d.slug}`}
            className={d.slug === doc.slug ? "legal-tab legal-tab--active" : "legal-tab"}
            aria-current={d.slug === doc.slug ? "page" : undefined}
          >
            {d.slug === "eula" ? "EULA" : d.title}
          </Link>
        ))}
      </nav>
      <article className="legal-doc">
        <h1 className="page-title">{doc.title}</h1>
        <p className="muted">Last updated {LEGAL_UPDATED}</p>
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        <p className="muted">
          Questions? <a href={CONTACT} target="_blank" rel="noopener noreferrer" className="accent">Contact AJ4200</a>.
        </p>
      </article>
    </main>
  );
}
