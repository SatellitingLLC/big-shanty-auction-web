"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import styles from "./SiteHeader.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ currentPage }: { currentPage?: "Home" | "About" | "Team" | "Contact" }) {
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header} ref={headerRef}>
      <Link className={styles.brand} href="/" aria-label="Big Shanty Auction home">
        Big Shanty
        <span>Auction</span>
      </Link>
      <button
        className={styles.menuToggle}
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <i />
        <i />
        <i />
      </button>
      <nav
        className={`${styles.navigation}${menuOpen ? ` ${styles.open}` : ""}`}
        id="site-menu"
        aria-label="Main navigation"
      >
        {links.map(({ href, label }) => (
          <Link
            href={href}
            key={label}
            aria-current={label === currentPage ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        <a className={styles.phone} href="tel:7702312019" onClick={() => setMenuOpen(false)}>
          (770) 231-2019
        </a>
      </nav>
    </header>
  );
}
