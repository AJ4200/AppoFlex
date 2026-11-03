import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="page not-found">
      <p className="not-found-code">404</p>
      <h1 className="page-title">Page not found</h1>
      <p className="muted">
        That page doesn&apos;t exist, or it has moved. Check the address or head back to somewhere familiar.
      </p>
      <div className="not-found-actions">
        <Link href="/" className="btn-confirm">
          Back home <Icon name="arrow" />
        </Link>
        <Link href="/providers" className="btn-confirm">
          Find a provider
        </Link>
      </div>
    </main>
  );
}
