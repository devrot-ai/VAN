"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { SafeUser } from "@/lib/db";
import type { NavItem } from "@/lib/nav";
import styles from "./Sidebar.module.css";
import AppIcon from "./AppIcon";
import NotificationBell from "./NotificationBell";

function roleLabel(role: SafeUser["role"]) {
  const map: Record<string, string> = {
    farmer: "Farmer",
    provider: "Provider",
    cooperative: "Cooperative",
    buyer: "Buyer",
    operations: "Operations",
  };
  return map[role] ?? role;
}

export default function Sidebar({
  items,
  user,
}: {
  items: NavItem[];
  user: SafeUser;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`} onClick={() => setOpen(false)} />
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.top}>
          <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
            <span className={styles.logoMark} aria-hidden="true" />
            <span className={styles.logoWord}>VAN</span>
          </Link>
          <span className={styles.portalTag}>{roleLabel(user.role)}</span>
        </div>

        <nav className={styles.nav} aria-label="Portal">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className={styles.navIcon}><AppIcon name={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-3)" }}>
          <NotificationBell />
        </div>

        <div className={styles.footer}>
          {user.farm_name ? <div className={styles.farm}>{user.farm_name}</div> : null}
          <div className={styles.user}>
            <span className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</span>
            <span className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </span>
          </div>
          <button className={styles.signout} onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <button className={styles.menuBtn} onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
        <span /><span /><span />
      </button>
    </>
  );
}
