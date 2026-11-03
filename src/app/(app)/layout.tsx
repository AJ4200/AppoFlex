import { requireUser } from "@/lib/auth";
import AutoRefresh from "@/components/ui/AutoRefresh";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <main className="page">
      <AutoRefresh />
      {children}
    </main>
  );
}
