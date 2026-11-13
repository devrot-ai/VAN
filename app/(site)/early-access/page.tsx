import StaticHero from "@/components/site/StaticHero";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import EarlyAccessForm from "@/components/site/EarlyAccessForm";
import styles from "./early.module.css";

const BENEFITS = [
  { title: "Priority onboarding", text: "Be among the first farms, providers and cooperatives set up in your region." },
  { title: "Shape the roadmap", text: "Early members tell us what to build next — your needs become our priorities." },
  { title: "Direct line to the team", text: "Talk to the people building VAN, not a call centre." },
];

export default function EarlyAccessPage() {
  return (
    <>
      <StaticHero
        eyebrow="Early access"
        title="Be one of the first farms on VAN."
        lead="Join the list to get priority onboarding, influence the roadmap, and try the platform before it opens widely."
      />

      <Section>
        <div className="container">
          <div className={styles.wrap}>
            <div className={styles.left}>
              <div className={styles.benefits}>
                {BENEFITS.map((b) => (
                  <div key={b.title} className={styles.benefit}>
                    <h3 className={styles.benefitTitle}>{b.title}</h3>
                    <p className="muted">{b.text}</p>
                  </div>
                ))}
              </div>
              <div className={styles.assurance}>
                <p className="muted" style={{ fontSize: "var(--text-sm)" }}>
                  We’re building in phases and inviting participants by region. Joining the
                  list doesn’t commit you to anything — it just keeps you informed and in
                  the running.
                </p>
              </div>
            </div>
            <div className={styles.right}>
              <Card>
                <EarlyAccessForm compact />
              </Card>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
