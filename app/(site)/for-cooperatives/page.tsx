import StaticHero from "@/components/site/StaticHero";
import Section, { SectionHeading } from "@/components/ui/Section";
import { FeatureGrid, Checklist, CtaBand } from "@/components/site/Blocks";
import styles from "../static.module.css";

const FEATURES = [
  { title: "Manage member farms", text: "Keep clear member records and control what each farm has authorised you to see." },
  { title: "A field overview", text: "See the participating farms and their fields through access you have been granted." },
  { title: "Shared service bookings", text: "Coordinate equipment and labour across member farms, with transparent allocation." },
  { title: "Equipment coordination", text: "Match machines across the group, reducing idle time and duplicate purchases." },
  { title: "Activity summaries", text: "Understand what is happening across members without drowning in detail." },
  { title: "Organisation reports", text: "Clear, aggregated reporting for the whole cooperative, built on authorised data." },
];

const CHECKLIST = [
  "Only see what members have authorised — privacy and consent are enforced",
  "Coordinate shared resources without stepping on individual farms’ records",
  "Keep a clear, current picture of activity across the group",
  "Produce reports that members and the organisation can trust",
];

export default function ForCooperativesPage() {
  return (
    <>
      <StaticHero
        eyebrow="For cooperatives"
        title="Coordinate many farms as one trusted organisation."
        lead="VAN gives cooperatives a governed view across member farms — shared bookings, equipment coordination and clear reporting — while respecting exactly what each member has authorised."
      />
      <Section>
        <div className="container">
          <SectionHeading eyebrow="What you get" title="A connected, authorised view of your group." />
          <div className={styles.sectionSpace}>
            <FeatureGrid items={FEATURES} />
          </div>
        </div>
      </Section>
      <Section className="surface-raise">
        <div className="container">
          <div className={styles.split}>
            <div>
              <SectionHeading eyebrow="How it works" title="Governed by consent, built for coordination." />
            </div>
            <Checklist items={CHECKLIST} />
          </div>
        </div>
      </Section>
      <CtaBand
        title="Bring your cooperative to VAN."
        text="Join early access to pilot VAN across your member farms."
        primaryHref="/early-access"
        primaryLabel="Request early access"
        secondaryHref="/for-farmers"
        secondaryLabel="See how farmers use it"
      />
    </>
  );
}
