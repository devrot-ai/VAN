import StaticHero from "@/components/site/StaticHero";
import Section, { SectionHeading } from "@/components/ui/Section";
import { FeatureGrid, Checklist, CtaBand } from "@/components/site/Blocks";
import styles from "../static.module.css";

const FEATURES = [
  { title: "A living record of your farm", text: "Fields, crops, history and operations in one place you actually trust." },
  { title: "Machinery when you need it", text: "Search, compare and book equipment from owners near you — no more phone tag." },
  { title: "Help you can rely on", text: "Find workers, operators and specialists, and track jobs to completion." },
  { title: "A coordinated harvest", text: "Plan lots, book transport and storage, and connect produce to buyers." },
  { title: "Know your numbers", text: "Expenses, sales and profitability summaries that make sense for a farm." },
  { title: "One sign-in for everything", text: "No more juggling a dozen logins and paper records." },
];

const CHECKLIST = [
  "Set up your fields once — boundaries, crops and history follow you everywhere",
  "See what needs doing today, this week and this season",
  "Book equipment and people from the same place you plan your work",
  "Understand what each enterprise and season actually returns",
  "Keep your data yours — clear, exportable and secure",
];

export default function ForFarmersPage() {
  return (
    <>
      <StaticHero
        eyebrow="For farmers"
        title="Run the whole farm from one calm, connected place."
        lead="VAN gives independent farmers a single record of their land, crops, machinery, people, harvests and finances — so the work of running a farm gets simpler, not more complicated."
      />
      <Section>
        <div className="container">
          <SectionHeading eyebrow="What you get" title="Everything that matters, together." />
          <div className={styles.sectionSpace}>
            <FeatureGrid items={FEATURES} />
          </div>
        </div>
      </Section>
      <Section className="surface-raise">
        <div className="container">
          <div className={styles.split}>
            <div>
              <SectionHeading eyebrow="How it works" title="Set up once, then farm." />
            </div>
            <Checklist items={CHECKLIST} />
          </div>
        </div>
      </Section>
      <CtaBand
        title="Ready to see your farm on VAN?"
        text="Join the early-access list and be first in line for your region."
        primaryHref="/early-access"
        primaryLabel="Request early access"
        secondaryHref="/platform"
        secondaryLabel="Explore the platform"
      />
    </>
  );
}
