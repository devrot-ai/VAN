import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import styles from "./partners.module.css";

const PARTNER_TYPES = [
  {
    title: "Input suppliers",
    text: "Seed, fertiliser and crop protection manufacturers can participate in VAN's procurement and distribution network, reaching farmers through a connected supply chain.",
  },
  {
    title: "Machinery and equipment providers",
    text: "Equipment manufacturers and dealers can work with VAN's machinery fleet, contributing to field operations and maintenance services.",
  },
  {
    title: "Agricultural service providers",
    text: "Agronomists, consultants and field service teams can integrate with VAN's operations management, providing expertise where needed.",
  },
  {
    title: "Processors",
    text: "Produce processing businesses can connect with VAN's post-harvest infrastructure, managing quality grading and packaging.",
  },
  {
    title: "Warehouses and storage operators",
    text: "Storage facility operators can integrate with VAN's storage management, ensuring produce is stored under the right conditions.",
  },
  {
    title: "Transport and logistics providers",
    text: "Logistics companies can connect with VAN's shipment operations, ensuring produce reaches its destination on time.",
  },
  {
    title: "Produce buyers",
    text: "Buyers and distributors can access quality-graded agricultural produce through VAN's connected commerce system.",
  },
  {
    title: "Research and technology partners",
    text: "Research institutions and technology companies can collaborate with VAN on agricultural innovation and data-driven farming.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">Partners</span>
          <h1 className={styles.heroTitle}>
            Building VAN's agricultural ecosystem together.
          </h1>
          <p className={styles.heroLead}>
            VAN works with the businesses and organisations that support
            agricultural operations. Whether you supply inputs, provide
            machinery, process produce or transport goods — there's a place
            for you in VAN's connected system.
          </p>
        </div>
      </section>

      <Section>
        <div className="container">
          <h2 className={styles.sectionTitle}>Who can partner with VAN</h2>
          <p className={styles.sectionLead}>
            VAN's operating ecosystem includes a wide range of agricultural
            businesses. Here's how each can participate.
          </p>
          <div className={styles.partnersGrid}>
            {PARTNER_TYPES.map((item) => (
              <div key={item.title} className={styles.partnerCard}>
                <h3 className={styles.partnerTitle}>{item.title}</h3>
                <p className={styles.partnerText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <h2 className={styles.sectionTitle}>How partnership works</h2>
          <p className={styles.sectionLead}>
            VAN is building an integrated agricultural operating company.
            Partners contribute their expertise, infrastructure or products
            to the system, while VAN coordinates the operations through its
            software platform.
          </p>
          <div className={styles.howItWorks}>
            <div className={styles.howStep}>
              <span className={styles.howNum}>01</span>
              <h3 className={styles.howTitle}>Connect</h3>
              <p className={styles.howText}>
                Reach out through our contact form with details about your
                business and how you'd like to work with VAN.
              </p>
            </div>
            <div className={styles.howStep}>
              <span className={styles.howNum}>02</span>
              <h3 className={styles.howTitle}>Explore</h3>
              <p className={styles.howText}>
                We'll discuss how your services fit into VAN's agricultural
                operation and what integration looks like.
              </p>
            </div>
            <div className={styles.howStep}>
              <span className={styles.howNum}>03</span>
              <h3 className={styles.howTitle}>Integrate</h3>
              <p className={styles.howText}>
                Work with VAN to connect your infrastructure, products or
                services to the platform and operational workflow.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container">
          <div className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              Interested in partnering with VAN?
            </h2>
            <p className={styles.finalCtaText}>
              Tell us about your business and how you'd like to contribute
              to VAN's agricultural ecosystem.
            </p>
            <Button href="/contact" variant="primary" size="lg">
              Partner Enquiry
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
