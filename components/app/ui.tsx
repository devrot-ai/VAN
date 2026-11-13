import { Suspense } from "react";
import Link from "next/link";
import styles from "./app.module.css";

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className={styles.pageHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1 className={styles.title}>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}

export function DemoBanner({ text = "You are viewing sample records. No real farm data is shown." }: { text?: string }) {
  return (
    <div className={styles.demoBanner}>
      <strong>Demo account</strong>
      <span>{text}</span>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export function Panel({ title, href, actionLabel, children }: { title: string; href?: string; actionLabel?: string; children: React.ReactNode }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span>{title}</span>
        {href ? <Link href={href}>{actionLabel ?? "View all →"}</Link> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className={styles.empty}>{text}</div>;
}

export function badgeClass(status: string) {
  if (status === "confirmed" || status === "online" || status === "active") {
    return `${styles.badge} ${styles.badgeLive}`;
  }
  if (status === "pending" || status === "maintenance") {
    return `${styles.badge} ${styles.badgeMilestone}`;
  }
  return styles.badge;
}

export function ListRow({
  title,
  meta,
  badge,
}: {
  title: string;
  meta?: React.ReactNode;
  badge?: string | null;
}) {
  return (
    <li className={styles.listItem}>
      <span className={styles.listTitle}>{title}</span>
      <span className={styles.listMeta}>
        {meta}
        {badge ? <span className={badgeClass(badge!)}>{badge}</span> : null}
      </span>
    </li>
  );
}

// --- Skeleton Loading Components ---

export function SkeletonStats() {
  return (
    <div className={styles.skeletonGrid}>
      <div className={styles.skeletonGridItem} />
      <div className={styles.skeletonGridItem} />
      <div className={styles.skeletonGridItem} />
      <div className={styles.skeletonGridItem} />
    </div>
  );
}

export function SkeletonPanels() {
  return (
    <div className={styles.skeletonGrid2}>
      <div className={styles.skeletonGrid2Item} />
      <div className={styles.skeletonGrid2Item} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className={styles.skeletonTable}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skeletonRow} />
      ))}
    </div>
  );
}

export function SkeletonText({ short }: { short?: boolean }) {
  return <div className={short ? styles.skeletonTextShort : styles.skeletonText} />;
}

export function LoadingOverlay({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div>
        <SkeletonStats />
        <SkeletonPanels />
      </div>
    }>
      {children}
    </Suspense>
  );
}
