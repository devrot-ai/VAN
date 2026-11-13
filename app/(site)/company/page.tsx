import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import styles from "./company.module.css";

export default function CompanyPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">About VAN</span>
          <h1 className={styles.heroTitle}>
            An agricultural company built for the entire journey.
          </h1>
          <p className={styles.heroLead}>
            VAN is building an integrated agricultural operating company that
            farmers can rely on throughout the agricultural cycle — from
            understanding the land to delivering produce to market.
          </p>
        </div>
      </section>

      <Section>
        <div className="container">
          <div className={styles.visionWrap}>
            <h2 className={styles.visionTitle}>Why VAN exists</h2>
            <p className={styles.visionText}>
              Agriculture is the foundation of every society. Yet the people who
              grow our food face a fragmented system — scattered services,
              unreliable supply chains, expensive machinery and disconnected
              records.
            </p>
            <p className={styles.visionText}>
              VAN is being built to change that. We intend to bring the
              resources, machinery, operations and infrastructure farmers need
              into one connected system — owned, leased and operated by one
              company that understands the entire agricultural journey.
            </p>
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <h2 className={styles.sectionTitle}>What VAN is building</h2>
          <p className={styles.sectionLead}>
            VAN is not a marketplace. Not a farm management app. Not a
            third-party service directory.
          </p>
          <div className={styles.buildingGrid}>
            <div className={styles.buildingCard}>
              <h3 className={styles.buildingTitle}>Physical infrastructure</h3>
              <p className={styles.buildingText}>
                Fields, machinery fleets, processing facilities, storage
                warehouses and transport vehicles — the physical assets that
                make agricultural operations possible.
              </p>
            </div>
            <div className={styles.buildingCard}>
              <h3 className={styles.buildingTitle}>Software platform</h3>
              <p className={styles.buildingText}>
                The VAN product coordinates every part of the operation — from
                soil assessments and field records to harvest lots, shipments
                and financial transactions.
              </p>
            </div>
            <div className={styles.buildingCard}>
              <h3 className={styles.buildingTitle}>Connected services</h3>
              <p className={styles.buildingText}>
                Agricultural inputs, machinery deployment, field operations,
                harvesting, processing and logistics — all working together
                as one system.
              </p>
            </div>
            <div className={styles.buildingCard}>
              <h3 className={styles.buildingTitle}>Farmer-first approach</h3>
              <p className={styles.buildingText}>
                Farmers retain ownership of their land and control of their
                decisions. VAN provides the infrastructure and services, not
                the commands.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container">
          <h2 className={styles.sectionTitle}>Current stage</h2>
          <p className={styles.sectionLead}>
            VAN is currently pre-launch. The product and 3D experience on
            this website demonstrate the intended future business using
            illustrative demonstration data.
          </p>
          <p className={styles.sectionLead}>
            We are building the foundation — the software platform, the
            operational model and the partnerships that will make VAN's
            agricultural operations a reality.
          </p>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <div className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              Want to be part of VAN's journey?
            </h2>
            <p className={styles.finalCtaText}>
              Whether you're a farmer, supplier, machinery business or
              potential partner — we'd like to hear from you.
            </p>
            <Button href="/contact" variant="onDark" size="lg">
              Contact VAN
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
