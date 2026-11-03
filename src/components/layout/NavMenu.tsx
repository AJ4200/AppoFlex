"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signoutAction } from "@/app/(auth)/actions";
import Icon from "@/components/ui/Icon";
import Hamburger from "./Hamburger";
import Logo from "./Logo";

export type NavLink = { href: string; label: string };

interface NavMenuProps {
  links: NavLink[];
  signedIn: boolean;
  unread: number;
}

export default function NavMenu({ links, signedIn, unread }: NavMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const items = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="nav-link"
      aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? "page" : undefined}
    >
      {link.label}
    </Link>
  ));

  const bell = signedIn && (
    <Link href="/notifications" className="btn-icon" aria-label={`Notifications (${unread} unread)`}>
      <Icon name="bell" size="1.3rem" />
      {unread > 0 && <span className="badge-dot">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );

  const signout = (
    <form action={signoutAction}>
      <button type="submit" className="btn-confirm btn-confirm--sm">
        Sign out
      </button>
    </form>
  );

  return (
    <nav className={`navbar ${open ? "open" : ""}`}>
      <div className="logo-container">
        <Logo />
      </div>

      <ul className="nav-links">{items.map((item) => <li key={item.key}>{item}</li>)}</ul>

      <div className="buttons-container">
        {signedIn && (
          <>
            {bell}
            {signout}
          </>
        )}
      </div>

      <div className="mobile-actions">
        {bell}
        <Hamburger isMenuOpen={open} toggleMenu={() => setOpen((v) => !v)} />
      </div>

      <ul className="menu-list">
        {items.map((item) => (
          <li key={item.key}>{item}</li>
        ))}
        {signedIn && (
          <>
            <li>{signout}</li>
          </>
        )}
      </ul>
    </nav>
  );
}
