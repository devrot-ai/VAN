import Link from "next/link";
import type { Pillar } from "@/lib/platform";
import styles from "./PillarRow.module.css";

/**
 * A full-width ledger row for a platform pillar. Replaces feature-card
 * grids: the platform is presented as a register — numbered entries with
 * hairline rules, inverting to forest on hover.
 */
export default function PillarRow({ pillar }: { pillar: Pillar }) {
  return (
    <Link href={`/platform/${pillar.slug}`} className={styles.row}>
      <span className={styles.index}>{pillar.index}</span>
      <span className={styles.name}>{pillar.name}</span>
      <span className={styles.desc}>{pillar.card}</span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}

export function PillarRows({ pillars }: { pillars: Pillar[] }) {
  return (
    <div className={styles.list}>
      {pillars.map((p) => (
        <PillarRow key={p.slug} pillar={p} />
      ))}
    </div>
  );
}
