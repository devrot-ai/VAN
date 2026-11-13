import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import styles from "./Blocks.module.css";

export function FeatureGrid({
  items,
}: {
  items: { title: string; text: string }[];
}) {
  return (
    <div className={styles.featureGrid}>
      {items.map((it) => (
        <Card key={it.title} className={styles.featureCard}>
          <h3 className={styles.featureTitle}>{it.title}</h3>
          <p className="muted">{it.text}</p>
        </Card>
      ))}
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className={styles.checklist}>
      {items.map((item) => (
        <li key={item} className={styles.checkitem}>
          <span className={styles.checkmark}>✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CtaBand({
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  text?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="surface-dark">
      <div className="container container--narrow" style={{ textAlign: "center" }}>
        <h2 className={styles.ctaTitle}>{title}</h2>
        {text ? <p className={styles.ctaText}>{text}</p> : null}
        <div className={styles.ctaButtons}>
          <Button href={primaryHref} variant="onDark" size="lg">{primaryLabel}</Button>
          {secondaryHref && secondaryLabel ? (
            <Button href={secondaryHref} variant="outlineDark" size="lg">{secondaryLabel}</Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
