import styles from "./StaticHero.module.css";

export default function StaticHero({
  eyebrow,
  title,
  lead,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={`${styles.hero} ${dark ? styles.dark : ""}`}>
      <div className="container container--narrow">
        <span className="eyebrow" style={dark ? { color: "var(--color-field)" } : undefined}>
          {eyebrow}
        </span>
        <h1 className={styles.title}>{title}</h1>
        {lead ? <p className={`${styles.lead} ${dark ? styles.leadDark : ""}`}>{lead}</p> : null}
      </div>
    </section>
  );
}
