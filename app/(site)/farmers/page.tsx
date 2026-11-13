import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import styles from "./farmers.module.css";

const SERVICES = [
  {
    title: "Land assessment and soil intelligence",
    text: "VAN maps your fields, conducts soil assessments and provides a clear picture of your land's potential — pH, nutrients, moisture, drainage and crop suitability.",
  },
  {
    title: "Seeds and agricultural inputs",
    text: "Access the seeds, fertilisers, soil amendments and crop protection products you need, sourced and delivered through VAN's supply infrastructure.",
  },
  {
    title: "Machinery and equipment",
    text: "VAN provides tractors, harvesters, sprayers and the operators who run them. Equipment is deployed to your fields when you need it.",
  },
  {
    title: "Farm operations management",
    text: "From land preparation through planting, irrigation, fertilisation and crop protection — VAN coordinates the operations across your fields.",
  },
  {
    title: "Harvest and post-harvest",
    text: "When crops are ready, VAN handles harvesting, collection, grading, processing and storage — managing the transition from field to market.",
  },
  {
    title: "Logistics and market access",
    text: "VAN transports produce to buyers, records deliveries and manages the commercial side — so you can focus on farming.",
  },
  {
    title: "Financial records and transparency",
    text: "Every input, operation, harvest and sale is recorded. You can see your farm's financial picture — costs, revenue and profitability — in one place.",
  },
];

const FAQ = [
  {
    q: "Do I still own my land?",
    a: "Yes. Farmers retain full ownership of their land and control of their farm businesses. VAN provides and manages the infrastructure, products and services it offers.",
  },
  {
    q: "Is VAN a marketplace?",
    a: "No. VAN is building an integrated agricultural operating company. We intend to own, lease and operate physical infrastructure — not just connect farmers with third-party listings.",
  },
  {
    q: "What stage is VAN at?",
    a: "VAN is currently pre-launch. The product and 3D experience on this website demonstrate the intended future business using illustrative demonstration data.",
  },
  {
    q: "How can I get involved?",
    a: "If you're a farmer interested in early access or a pilot, contact VAN through our contact page. We're building this for farmers and want to hear from you.",
  },
];

export default function FarmersPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">For farmers</span>
          <h1 className={styles.heroTitle}>
            Built around the people who grow our food.
          </h1>
          <p className={styles.heroLead}>
            VAN is building an agricultural company that serves independent,
            small and medium-sized and family-owned farms. We provide the
            infrastructure, inputs, machinery and services you need throughout
            the agricultural cycle.
          </p>
          <div className={styles.heroCta}>
            <Button href="/contact" variant="primary" size="lg">
              Discuss a Pilot with VAN
            </Button>
            <Button href="/product" variant="ghost" size="lg">
              Explore the Product
            </Button>
          </div>
        </div>
      </section>

      <Section>
        <div className="container">
          <h2 className={styles.sectionTitle}>What VAN provides for farmers</h2>
          <p className={styles.sectionLead}>
            From understanding your land to delivering your harvest to market,
            VAN connects every part of the agricultural journey.
          </p>
          <div className={styles.servicesGrid}>
            {SERVICES.map((item) => (
              <div key={item.title} className={styles.serviceCard}>
                <h3 className={styles.serviceTitle}>{item.title}</h3>
                <p className={styles.serviceText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Your land. Your decisions. VAN's infrastructure.
          </h2>
          <p className={styles.sectionLead}>
            Farmers retain ownership of their land and make decisions about
            their agricultural business. VAN provides the resources, machinery,
            operations and infrastructure — bringing everything into one
            connected system.
          </p>
        </div>
      </Section>

      <Section>
        <div className="container">
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <div key={item.q} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.q}</h3>
                <p className={styles.faqAnswer}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section variant="dark">
        <div className="container">
          <div className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              Interested in working with VAN?
            </h2>
            <p className={styles.finalCtaText}>
              Get in touch to discuss a pilot or learn more about how VAN can
              support your farm.
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
