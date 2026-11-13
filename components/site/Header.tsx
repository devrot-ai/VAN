"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./Site.module.css";

const NAV = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Product", href: "/product" },
  { label: "3D Experience", href: "/journey" },
  { label: "For Farmers", href: "/farmers" },
  { label: "Company", href: "/company" },
  { label: "Contact", href: "/contact" },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={styles.logo} aria-label="VAN — home">
      <span
        aria-hidden="true"
        className={`${styles.logoMark} ${dark ? styles.logoMarkDark : ""}`}
      />
      <span className={`${styles.logoWord} ${dark ? styles.logoWordDark : ""}`}>
        VAN
      </span>
    </Link>
  );
}

export default function Header({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${styles.header} ${dark ? styles.headerDark : ""}`}>
      <div className={`container ${styles.headerInner}`}>
        <Logo dark={dark} />

        <button
          className={styles.burger}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className={styles.navCta}>
            <Button href="/product" variant={dark ? "outlineDark" : "ghost"} size="sm">
              Explore Demo
            </Button>
            <Button href="/contact" variant={dark ? "onDark" : "primary"} size="sm">
              Contact VAN
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
