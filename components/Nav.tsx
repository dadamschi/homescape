"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icons from "./Icons";
import ThemeSwitch from "./ThemeSwitch";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  // { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = () => {
    setMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo" onClick={handleNav}>
          <span className="nav-logo-accent">homescape</span>construction, inc.
        </Link>
        <ul className="nav-links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={isActive(l.href) ? "active" : ""} onClick={handleNav}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeSwitch />
        <button className="nav-hamburger" onClick={() => setMenuOpen(true)}>
          {Icons.menu}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>
            {Icons.close}
          </button>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={handleNav}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" onClick={handleNav} style={{ color: "var(--color-accent)" }}>
            Contact us!
          </Link>
        </div>
      )}
    </>
  );
}
