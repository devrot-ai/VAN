import Section, { SectionHeading } from "@/components/ui/Section";
import { PillarRows } from "@/components/site/PillarRow";
import Button from "@/components/ui/Button";
import { PILLARS } from "@/lib/platform";
import styles from "./platform.module.css";

export default function PlatformPage() {
  return (
    <>
      <Section className="surface-dark">
        <div className="container container--narrow">
          <span className="eyebrow" style={{ color: "var(--color-field)" }}>The platform</span>
          <h1 className={styles.pageTitle}>One platform for the whole farming journey.</h1>
          <p className={styles.pageLead}>
            VAN is organised around six connected pillars. Together they form the operating
            environment through which a farm plans, operates, harvests and sells.
          </p>
        </div>
      </Section>

      <Section>
        <div className="container">
          <PillarRows pillars={PILLARS} />
        </div>
      </Section>

      <Section className="surface-raise">
        <div className="container">
          <div className={styles.bottomWrap}>
            <SectionHeading
              eyebrow="See it in action"
              title="Walk through a real farming year"
              lead="See how the pillars connect across a season on the homepage — from planning in winter to selling in autumn."
            />
            <Button href="/" variant="secondary" size="lg">Back to homepage →</Button>
          </div>
        </div>
      </Section>
    </>
  );
}
