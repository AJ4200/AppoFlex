"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signoutAction } from "@/app/(auth)/actions";
import FlipLink from "@/components/ui/FlipLink";
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
      <span aria-hidden="true">🔔</span>
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
        {signedIn ? (
          <>
            {bell}
            {signout}
          </>
        ) : (
          <>
            <FlipLink href="/signin" label="Sign In" className="animate__animated animate__backInLeft" />
            <FlipLink
              href="/signup"
              label="Sign Up"
              variant="alt"
              className="animate__animated animate__backInRight"
            />
          </>
        )}
      </div>

      <Hamburger isMenuOpen={open} toggleMenu={() => setOpen((v) => !v)} />

      <ul className="menu-list">
        {items.map((item) => (
          <li key={item.key}>{item}</li>
        ))}
        {signedIn ? (
          <>
            <li>{bell}</li>
            <li>{signout}</li>
          </>
        ) : (
          <>
            <li>
              <FlipLink href="/signin" label="Sign In" />
            </li>
            <li>
              <FlipLink href="/signup" label="Sign Up" variant="alt" />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
