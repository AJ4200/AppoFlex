import { and, count, eq, isNull } from "drizzle-orm";
import { db, notifications } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import NavMenu, { type NavLink } from "./NavMenu";

export default async function Navbar() {
  const user = await getCurrentUser();

  let unread = 0;
  const links: NavLink[] = [];

  if (user) {
    const [row] = await db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
    unread = row?.value ?? 0;

    links.push({ href: "/dashboard", label: "Dashboard" });
    if (user.role === "provider") {
      links.push(
        { href: "/dashboard/services", label: "Services" },
        { href: "/dashboard/hours", label: "Hours" },
      );
    } else {
      links.push({ href: "/providers", label: "Find a provider" });
    }
    links.push({ href: "/profile", label: "Profile" });
  }

  return (
    <header>
      <NavMenu links={links} signedIn={Boolean(user)} unread={unread} />
    </header>
  );
}
