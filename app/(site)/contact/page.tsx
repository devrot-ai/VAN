import StaticHero from "@/components/site/StaticHero";
import Section, { SectionHeading } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import ContactForm from "@/components/site/ContactForm";
import styles from "../static.module.css";

const CHANNELS = [
  { title: "Sales & early access", meta: "early-access@van.farm" },
  { title: "Partnerships & providers", meta: "providers@van.farm" },
  { title: "Press & media", meta: "press@van.farm" },
  { title: "Support", meta: "support@van.farm" },
];

export default function ContactPage() {
  return (
    <>
      <StaticHero
        eyebrow="Contact"
        title="Talk to the VAN team."
        lead="Whether you’re a farmer, an equipment owner, a cooperative or a future partner — we’d love to hear from you."
      />

      <Section>
        <div className="container">
          <div className={styles.split}>
            <div className={styles.block}>
              <SectionHeading eyebrow="Get in touch" title="Send us a message." />
              <div className={`${styles.sectionSpace} ${styles.contactCards}`}>
                {CHANNELS.map((c) => (
                  <Card key={c.title} className={styles.contactCard}>
                    <span className={styles.contactTitle}>{c.title}</span>
                    <span className={styles.contactMeta}>{c.meta}</span>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Card>
                <ContactForm />
              </Card>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
