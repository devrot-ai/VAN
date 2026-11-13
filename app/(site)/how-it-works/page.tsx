import Link from "next/link";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { PILLARS } from "@/lib/platform";
import styles from "./how.module.css";

const STEPS = [
  {
    title: "Understand the land",
    text: "Every agricultural operation begins with understanding the land. VAN maps field boundaries, conducts soil assessments and evaluates crop suitability before any planting decision.",
    pillar: "Land Intelligence",
  },
  {
    title: "Assess soil and field conditions",
    text: "Soil sampling and laboratory analysis provide measurements for pH, organic carbon, nutrients, moisture and drainage. These results inform what the land can support and what inputs it needs.",
    pillar: "Land Intelligence",
  },
  {
    title: "Procure seeds and agricultural inputs",
    text: "Based on the assessment, VAN sources and delivers the right seeds, fertilisers, soil amendments and crop protection products through its supply infrastructure.",
    pillar: "Agricultural Inputs",
  },
  {
    title: "Arrange machinery and infrastructure",
    text: "VAN deploys tractors, implements, sprayers and operators from its machinery fleet. Equipment is assigned to fields, scheduled for work and maintained through the season.",
    pillar: "Machinery & Infrastructure",
  },
  {
    title: "Execute crop operations",
    text: "Land preparation, planting, irrigation, fertilisation and crop protection are coordinated through VAN's operations management, with field workers and equipment working together.",
    pillar: "Farm Operations",
  },
  {
    title: "Monitor and manage the crop cycle",
    text: "Throughout the growing season, VAN tracks crop development, weather conditions, field observations and operational records to ensure the crop reaches its potential.",
    pillar: "Farm Operations",
  },
  {
    title: "Harvest and collect produce",
    text: "When crops reach maturity, VAN deploys harvesting equipment, collects produce, records quantities and quality grades, and manages the transition from field to storage.",
    pillar: "Harvest & Processing",
  },
  {
    title: "Process and grade produce",
    text: "Harvested produce is sorted, graded, dried and packaged at VAN's processing facilities, ensuring quality standards are met before storage or dispatch.",
    pillar: "Harvest & Processing",
  },
  {
    title: "Store and transport produce",
    text: "VAN's storage infrastructure — grain silos, warehouses and cold storage — holds produce until it reaches the market. Transport vehicles move produce to buyers and distribution centres.",
    pillar: "Logistics",
  },
  {
    title: "Connect with buyers and manage payments",
    text: "VAN connects produce with buyers, records deliveries, tracks payments and maintains financial records for the complete crop cycle — from input costs to sales revenue.",
    pillar: "Finance & Commerce",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">How VAN works</span>
          <h1 className={styles.heroTitle}>
            From soil assessment to market delivery — one connected operation.
          </h1>
          <p className={styles.heroLead}>
            VAN is building an integrated agricultural company that takes
            responsibility for the entire agricultural journey. Here's how each
            stage connects to form one complete operation.
          </p>
        </div>
      </section>

      {/* The Journey Steps */}
      <Section>
        <div className="container">
          <div className={styles.stepsList}>
            {STEPS.map((step, i) => (
              <div key={step.title} className={styles.stepItem}>
                <div className={styles.stepNumber}>
                  <span className={styles.stepNum}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.stepPillar}>{step.pillar}</span>
                </div>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Six Pillars Overview */}
      <Section variant="dark">
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(238,242,236,0.5)" }}>Six pillars</span>
          <h2 className={styles.sectionTitle}>The pillars that hold it together.</h2>
          <p className={styles.sectionLead}>
            Each step in the journey is supported by one of VAN's six
            interconnected pillars. Together they form a complete agricultural
            operating system.
          </p>
          <div className={styles.pillarsGrid}>
            {PILLARS.map((pillar) => (
              <div key={pillar.slug} className={styles.pillarCard}>
                <span className={styles.pillarIndex}>{pillar.index}</span>
                <h3 className={styles.pillarName}>{pillar.name}</h3>
                <p className={styles.pillarText}>{pillar.card}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Software and Physical */}
      <Section>
        <div className="container">
          <div className={styles.dualApproach}>
            <div className={styles.dualPanel}>
              <h3 className={styles.dualPanelTitle}>Physical operations</h3>
              <p className={styles.dualPanelText}>
                VAN intends to own, lease, procure and operate physical
                agricultural infrastructure — fields, machinery, processing
                facilities, storage and transport.
              </p>
            </div>
            <div className={styles.dualPanel}>
              <h3 className={styles.dualPanelTitle}>Software platform</h3>
              <p className={styles.dualPanelText}>
                The VAN product coordinates every part of the operation — from
                soil assessments and field records to harvest lots, shipments
                and financial transactions.
              </p>
            </div>
          </div>
          <div className={styles.ctaRow}>
            <Button href="/product" variant="primary" size="lg">
              Explore the Product
            </Button>
            <Button href="/journey" variant="ghost" size="lg">
              See it in 3D
            </Button>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="dark">
        <div className="container">
          <div className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              Ready to see how VAN can work for your farm?
            </h2>
            <p className={styles.finalCtaText}>
              Get in touch to discuss a pilot or learn more about VAN's
              agricultural operations.
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
