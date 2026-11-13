import Link from "next/link";
import type { Pillar } from "@/lib/platform";
import styles from "./PillarCard.module.css";

function Motif({ pillar }: { pillar: Pillar }) {
  const i = Number(pillar.index) - 1;
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill={i % 2 === 0 ? "#eaf0e4" : "#f4ead9"} />
      {i === 0 ? (
        // field map: contour rows
        <g stroke="#285c49" strokeWidth="2" fill="none">
          <path d="M14 22c8-6 16 6 24 0s12 8 16 2" />
          <path d="M12 34c8-6 16 6 24 0s12 8 16 2" />
          <path d="M14 46c8-6 16 6 24 0s12 8 16 2" />
          <circle cx="18" cy="18" r="3" fill="#c48a47" stroke="none" />
        </g>
      ) : i === 1 ? (
        // machinery: wheel + hub
        <g stroke="#285c49" strokeWidth="2.5" fill="none">
          <circle cx="32" cy="34" r="14" />
          <path d="M32 20v-6M32 48v6M18 34h-6M50 34h-6" />
          <circle cx="32" cy="34" r="4" fill="#c48a47" stroke="none" />
        </g>
      ) : i === 2 ? (
        // people: three nodes
        <g fill="#285c49">
          <circle cx="22" cy="30" r="6" />
          <circle cx="42" cy="30" r="6" />
          <circle cx="32" cy="46" r="6" />
          <path d="M22 32l8 12M42 32l-8 12" stroke="#c48a47" strokeWidth="2.5" />
        </g>
      ) : i === 3 ? (
        // harvest: crop rows + sun
        <g stroke="#285c49" strokeWidth="2" fill="none">
          <path d="M14 44c4-8 0-16 4-24" />
          <path d="M32 44c4-8 0-16 4-24" />
          <path d="M50 44c4-8 0-16 4-24" />
          <circle cx="46" cy="18" r="6" stroke="#c48a47" />
        </g>
      ) : i === 4 ? (
        // finance: ledger lines
        <g stroke="#285c49" strokeWidth="2" fill="none">
          <rect x="16" y="18" width="32" height="28" rx="4" />
          <path d="M16 30h32M16 38h20" />
          <path d="M22 24h8" />
        </g>
      ) : (
        // connected: nodes + links
        <g fill="#285c49">
          <circle cx="20" cy="20" r="4" />
          <circle cx="44" cy="20" r="4" />
          <circle cx="32" cy="44" r="4" />
          <path d="M23 23l7 18M41 23l-7 18M24 20h16" stroke="#c48a47" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
}

export default function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <Link href={`/platform/${pillar.slug}`} className={styles.card}>
      <Motif pillar={pillar} />
      <div className={styles.body}>
        <span className={styles.index}>{pillar.index}</span>
        <h3 className={styles.title}>{pillar.name}</h3>
        <p className={styles.desc}>{pillar.card}</p>
      </div>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  );
}
