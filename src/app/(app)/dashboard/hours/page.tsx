import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import HoursForm from "@/components/provider/HoursForm";
import { availability, db } from "@/db";
import { requireProvider } from "@/lib/auth";

export const metadata: Metadata = { title: "Hours" };

export default async function HoursPage() {
  const user = await requireProvider();
  const hours = await db.select().from(availability).where(eq(availability.providerId, user.id));

  return (
    <>
      <div className="page-title">
        <h1>Working hours</h1>
        <p>Clients can only book inside the hours you set here.</p>
      </div>
      <HoursForm provider={user.provider} hours={hours} />
    </>
  );
}
