import StaticHero from "@/components/site/StaticHero";
import Section, { SectionHeading } from "@/components/ui/Section";
import { FeatureGrid, Checklist, CtaBand } from "@/components/site/Blocks";
import styles from "../static.module.css";

const FEATURES = [
  { title: "List equipment once", text: "Photos, specs, pricing, service areas and an availability calendar in one clean profile." },
  { title: "Get qualified booking requests", text: "Farmers request your machines with clear dates and scope — accept or decline in a tap." },
  { title: "Run the job to completion", text: "Assign operators, update status and record completion evidence with a clear trail." },
  { title: "Keep maintenance honest", text: "A structured maintenance record for every machine supports reliability and trust." },
  { title: "See your earnings", text: "Transaction and earnings history let you know exactly what your equipment returns." },
  { title: "Offer your services", text: "For labour, contracting and specialist help — list skills, locations and availability." },
];

const CHECKLIST = [
  "Create a provider profile that reflects your equipment and skills",
  "Keep an availability calendar so farmers can plan around you",
  "Manage bookings, jobs and status from one inbox",
  "Build a reputation through a complete, honest work history",
];

export default function ForProvidersPage() {
  return (
    <>
      <StaticHero
        eyebrow="For providers"
        title="Make your equipment and expertise work harder."
        lead="Whether you own machines, run a contracting crew or offer specialised services, VAN connects you to work that fits what you do — with clear terms and a reliable record."
      />
      <Section>
        <div className="container">
          <SectionHeading eyebrow="Equipment owners" title="A dependable market for machine time." />
          <div className={styles.sectionSpace}>
            <FeatureGrid items={FEATURES.slice(0, 5)} />
          </div>
        </div>
      </Section>
      <Section className="surface-raise">
        <div className="container">
          <SectionHeading eyebrow="Service providers" title="For contractors, operators, labour and specialists." />
          <div className={styles.sectionSpace}>
            <FeatureGrid items={FEATURES.slice(5)} />
          </div>
        </div>
      </Section>
      <Section>
        <div className="container">
          <div className={styles.split}>
            <div>
              <SectionHeading eyebrow="How it works" title="From listing to a job well done." />
            </div>
            <Checklist items={CHECKLIST} />
          </div>
        </div>
      </Section>
      <CtaBand
        title="List your equipment or services on VAN."
        text="Join early access and be among the first providers in your region."
        primaryHref="/early-access"
        primaryLabel="Request early access"
        secondaryHref="/platform/machinery"
        secondaryLabel="See the machinery pillar"
      />
    </>
  );
}
