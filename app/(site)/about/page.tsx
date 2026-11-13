import StaticHero from "@/components/site/StaticHero";
import Section, { SectionHeading } from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import { CtaBand } from "@/components/site/Blocks";
import styles from "../static.module.css";

const PRINCIPLES = [
  { title: "Built for the farm, not the demo", text: "We measure success by whether a farm runs better on Tuesday, not by how the slides look." },
  { title: "One connected record", text: "The same facts should not be re-typed in five systems. Data flows, it is not duplicated." },
  { title: "Trustworthy by default", text: "Clear permission boundaries, honest data and no dark patterns. What you see is what is real." },
  { title: "Premium but grounded", text: "Calm, precise design that is technical enough for professionals and welcoming enough for everyone." },
  { title: "Start local, scale global", text: "We build a foundation that works for one family farm and can grow across borders." },
];

export default function AboutPage() {
  return (
    <>
      <StaticHero
        eyebrow="About VAN"
        title="We’re building the operating environment for modern farming."
        lead="VAN is an agricultural technology company with one conviction: a farm should not need a dozen disconnected tools to run its business. We exist to bring the whole journey together."
      />

      <Section>
        <div className="container container--narrow">
          <SectionHeading eyebrow="Why we exist" title="Farming is fragmented. It doesn’t have to be." />
          <div className={styles.legalBody}>
            <p>
              The farmers we work with are brilliant operators. They understand their land,
              their crops and their people. Yet running the business side of a farm means
              stitching together bookkeeping apps, mapping tools, machinery marketplaces,
              messaging threads and paper ledgers — none of which talk to each other.
            </p>
            <p>
              Every time information is re-typed, something is lost. Decisions take longer.
              Margins shrink under the weight of administration. Our belief is simple: the
              platform should do the organising, so the farmer can do the farming.
            </p>
            <p>
              VAN brings farm intelligence, machinery access, people and services, harvest
              and logistics, finance and commerce, and connected hardware into one
              connected product — not as separate features, but as one coherent operating
              environment.
            </p>
          </div>
        </div>
      </Section>

      <Section className="surface-raise">
        <div className="container">
          <SectionHeading eyebrow="How we work" title="Principles that guide every decision." />
          <div className={styles.sectionSpace} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
            {PRINCIPLES.map((p) => (
              <Card key={p.title} raise>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "var(--space-2)" }}>{p.title}</h3>
                <p className="muted">{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container container--narrow">
          <SectionHeading eyebrow="The road ahead" title="We’re deliberate, and we’re just starting." />
          <div className={styles.legalBody}>
            <p>
              We are not claiming farmers are already using VAN at scale, nor inventing
              adoption numbers. We are building carefully: every feature earns its place
              by solving a real problem, and every claim is grounded in what the product
              actually does today.
            </p>
            <p>
              Early access lets us work closely with real farms, cooperatives and
              providers — shaping the roadmap on the ground before we grow further afield.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand
        title="Help shape what VAN becomes."
        text="Join early access or get in touch — we’d love to learn from your farm."
        primaryHref="/early-access"
        primaryLabel="Request early access"
        secondaryHref="/contact"
        secondaryLabel="Contact us"
      />
    </>
  );
}
