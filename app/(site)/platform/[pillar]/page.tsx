import Link from "next/link";
import { notFound } from "next/navigation";
import Section, { SectionHeading } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PILLARS, pillarBySlug } from "@/lib/platform";
import styles from "./pillar.module.css";

export function generateStaticParams() {
  return PILLARS.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar: slug } = await params;
  const pillar = pillarBySlug(slug);
  return { title: pillar ? `${pillar.name} — VAN` : "Platform — VAN" };
}

export default async function PillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const { pillar: slug } = await params;
  const pillar = pillarBySlug(slug);
  if (!pillar) notFound();

  return (
    <>
      {/* Pillar switcher */}
      <div className={styles.switcherWrap}>
        <div className="container">
          <nav className={styles.switcher} aria-label="Pillar">
            {PILLARS.map((p) => (
              <Link
                key={p.slug}
                href={`/platform/${p.slug}`}
                className={p.slug === pillar.slug ? styles.switcherActive : ""}
              >
                {p.short}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <Section className={`surface-dark ${styles.pillarHero}`} >
        <div className="container">
          <div className={styles.heroMeta}>
            <span className={styles.heroIndex}>{pillar.index}</span>
            <span className="eyebrow" style={{ color: "var(--color-field)" }}>{pillar.name}</span>
          </div>
          <h1 className={styles.heroTitle}>{pillar.short}.</h1>
          <p className={styles.heroLead}>
            {pillar.card}
          </p>
          <div className={styles.heroCta}>
            <Button href="/early-access" variant="onDark" size="lg">Request early access</Button>
            <Button href="/contact" variant="outlineDark" size="lg">Talk to us</Button>
          </div>
        </div>
      </Section>

      {/* The problem */}
      <Section className="surface-raise">
        <div className="container">
          <div className={styles.split}>
            <div>
              <SectionHeading eyebrow="The agricultural problem" title={pillar.problem.lead} />
            </div>
            <ul className={styles.pains}>
              {pillar.problem.pains.map((p) => (
                <li key={p} className={styles.pain}>
                  <span className={styles.painDot} /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <div className="container">
          <SectionHeading eyebrow="How it works" title={pillar.how.title} />
          <div className={styles.howGrid}>
            {pillar.how.points.map((pt, i) => (
              <Card key={pt} className={styles.howCard}>
                <span className={styles.howNum}>{String(i + 1).padStart(2, "0")}</span>
                <p>{pt}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Who uses it + workflows */}
      <Section className="surface-raise">
        <div className="container">
          <div className={styles.split}>
            <div>
              <SectionHeading eyebrow="Who uses it" title="Built for the people who do the work." />
              <ul className={styles.whoList}>
                {pillar.who.map((w) => (
                  <li key={w} className={styles.whoItem}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading eyebrow="Main workflows" title="Everyday jobs, made simple." />
              <div className={styles.workflowGrid}>
                {pillar.workflows.map((w) => (
                  <div key={w} className={styles.workflow}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Connects */}
      <Section className="surface-dark">
        <div className="container container--narrow">
          <SectionHeading
            eyebrow="Connected"
            title="Part of a bigger whole."
            lead={pillar.connects}
            dark
            align="center"
          />
          <div className={styles.connectCta}>
            <Button href="/platform" variant="onDark">See all six pillars</Button>
          </div>
        </div>
      </Section>

      {/* Long-term */}
      <Section>
        <div className="container container--narrow">
          <SectionHeading
            eyebrow="Long-term capability"
            title="Where this pillar is heading."
            lead={pillar.longterm}
            align="center"
          />
        </div>
      </Section>
    </>
  );
}
