import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/site/ContactForm";
import styles from "./contact.module.css";

const ENQUIRY_TYPES = [
  "Farmer — Early access / Pilot",
  "Agricultural supplier",
  "Machinery partner",
  "Processing / Storage operator",
  "Transport / Logistics business",
  "Produce buyer",
  "Research / Technology partner",
  "General enquiry",
];

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">Contact</span>
          <h1 className={styles.heroTitle}>
            Get in touch with VAN.
          </h1>
          <p className={styles.heroLead}>
            Whether you're a farmer interested in a pilot, a supplier looking
            to partner, or an organisation exploring how VAN can support
            agricultural operations — we'd like to hear from you.
          </p>
        </div>
      </section>

      <Section>
        <div className="container">
          <div className={styles.contactLayout}>
            <div className={styles.contactInfo}>
              <h2 className={styles.contactInfoTitle}>
                How we can help
              </h2>
              <div className={styles.enquiryList}>
                {ENQUIRY_TYPES.map((type) => (
                  <div key={type} className={styles.enquiryItem}>
                    <span className={styles.enquiryDot} />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
              <div className={styles.contactNote}>
                <p>
                  VAN is currently pre-launch. All enquiries are reviewed by
                  the VAN team. We'll respond as soon as we can.
                </p>
              </div>
            </div>
            <div className={styles.contactFormWrap}>
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <div className={styles.alternatives}>
            <h2 className={styles.alternativesTitle}>
              Other ways to explore VAN
            </h2>
            <div className={styles.altActions}>
              <Button href="/product" variant="outlineDark" size="lg">
                Explore the Product
              </Button>
              <Button href="/journey" variant="onDark" size="lg">
                3D Experience
              </Button>
              <Button href="/how-it-works" variant="ghost" size="lg">
                How VAN Works
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
