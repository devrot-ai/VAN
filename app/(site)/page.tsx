import Link from "next/link";
import Button from "@/components/ui/Button";
import Section, { SectionHeading } from "@/components/ui/Section";
import { PILLARS } from "@/lib/platform";
import styles from "./home.module.css";

const FARMING_PARTS = [
  { title: "Understanding soil and land", text: "Every farm starts with knowing what's beneath the surface — soil health, drainage, and what the land can support." },
  { title: "Seeds and agricultural inputs", text: "Finding the right seeds, fertilisers and crop protection products at the right time and price." },
  { title: "Machinery and equipment", text: "Arranging tractors, harvesters, sprayers and the operators who run them across the season." },
  { title: "Labour and field operations", text: "Coordinating planting, irrigation, fertilisation, monitoring and crop protection across multiple fields." },
  { title: "Harvesting and collection", text: "Timing the harvest, deploying equipment, collecting and weighing produce under pressure." },
  { title: "Processing and storage", text: "Grading, drying, packaging and storing produce until it reaches the market." },
  { title: "Transport and logistics", text: "Moving produce from farm to buyer with reliable vehicles and clear delivery records." },
  { title: "Finding buyers and payments", text: "Connecting with markets, recording sales and ensuring payments reach the farmer." },
];

const AUDIENCES = [
  {
    title: "Independent farmers",
    text: "VAN provides the infrastructure, inputs, machinery and services farmers need throughout the agricultural cycle — from soil assessment to market delivery.",
    link: { label: "See VAN for farmers", href: "/farmers" },
  },
  {
    title: "Agricultural suppliers",
    text: "Input manufacturers and suppliers can participate in VAN's procurement and distribution network, reaching farmers through a connected system.",
    link: { label: "Partner with VAN", href: "/partners" },
  },
  {
    title: "Machinery businesses",
    text: "Equipment owners and operators can work with VAN's machinery fleet, contributing to field operations and maintenance services.",
    link: { label: "Learn more", href: "/partners" },
  },
  {
    title: "Processors and warehouses",
    text: "Storage and processing operators can integrate with VAN's post-harvest infrastructure, managing produce quality and distribution.",
    link: { label: "Partner with VAN", href: "/partners" },
  },
  {
    title: "Transport providers",
    text: "Logistics companies can connect with VAN's shipment and delivery operations, ensuring produce reaches its destination.",
    link: { label: "Learn more", href: "/partners" },
  },
  {
    title: "Produce buyers",
    text: "Buyers and distributors can access quality-graded agricultural produce through VAN's connected commerce system.",
    link: { label: "Contact VAN", href: "/contact" },
  },
];

export default function HomePage() {
  return (
    <>
      {/* SECTION 1 — HERO */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">An integrated agricultural company</span>
            <h1 className={styles.heroTitle}>
              Helping farmers,{" "}
              <em className={styles.heroAccent}>from soil to sale.</em>
            </h1>
            <p className={styles.heroLead}>
              VAN is building an integrated agricultural company that assesses
              farmland, supplies agricultural inputs, provides machinery and
              manages farming operations, then takes harvest through processing,
              storage and transportation towards the market.
            </p>
            <div className={styles.heroCta}>
              <Button href="/product" variant="primary" size="lg">
                Explore the VAN Product
              </Button>
              <Button href="/journey" variant="ghost" size="lg">
                Experience VAN in 3D
              </Button>
            </div>
            <p className={styles.heroFoot}>
              All demonstration content is illustrative. VAN is currently pre-launch.
            </p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImage}>
              <div className={styles.heroImageInner} />
              <div className={styles.heroImageOverlay}>
                <span className={styles.heroImageLabel}>Agricultural landscape</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE REALITY OF FARMING */}
      <Section>
        <div className="container">
          <span className="eyebrow">The challenge</span>
          <h2 className={styles.sectionTitle}>One farm. Many moving parts.</h2>
          <p className={styles.sectionLead}>
            Running a farm involves coordinating many separate activities. Each
            one is essential, and together they form a complex operation that
            demands attention at every stage.
          </p>
          <div className={styles.painGrid}>
            {FARMING_PARTS.map((item, i) => (
              <div key={item.title} className={styles.painItem}>
                <span className={styles.painIndex}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.painTitle}>{item.title}</h3>
                <p className={styles.painText}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SECTION 3 — THE VAN OPERATING MODEL (SIX PILLARS) */}
      <Section variant="dark">
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(238,242,236,0.5)" }}>How VAN works</span>
          <h2 className={styles.sectionTitle} style={{ color: "var(--text-on-dark)" }}>
            One connected agricultural operation.
          </h2>
          <p className={styles.sectionLead} style={{ color: "rgba(238,242,236,0.65)" }}>
            VAN is built around six interconnected pillars. Together they form
            a complete agricultural operation — from understanding the land to
            delivering produce to market.
          </p>
          <div className={styles.connectGrid}>
            {PILLARS.map((pillar, i) => (
              <div key={pillar.slug} className={styles.connectCell}>
                <span className={styles.connectIndex}>{pillar.index}</span>
                <h3 className={styles.connectName}>{pillar.name}</h3>
                <p className={styles.connectText}>{pillar.short}</p>
                <span className={styles.connectNext}>
                  {pillar.connects ? "Connected" : "Core pillar"}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Button href="/how-it-works" variant="onDark" size="lg">
              See How VAN Works
            </Button>
          </div>
        </div>
      </Section>

      {/* SECTION 4 — INTRODUCE THE PRODUCT */}
      <Section>
        <div className="container">
          <div className={styles.productIntro}>
            <div>
              <span className="eyebrow">The software</span>
              <h2 className={styles.sectionTitle}>The software behind the operation.</h2>
              <p className={styles.sectionLead}>
                VAN's product is the software platform that coordinates and
                manages every part of the agricultural operation — from field
                assessment to financial settlement.
              </p>
              <div className={styles.productFeatures}>
                <div className={styles.productFeature}>
                  <span className={styles.productFeatureIcon}>📊</span>
                  <span>Farm overview and field management</span>
                </div>
                <div className={styles.productFeature}>
                  <span className={styles.productFeatureIcon}>🔬</span>
                  <span>Land intelligence and soil assessment</span>
                </div>
                <div className={styles.productFeature}>
                  <span className={styles.productFeatureIcon}>🚜</span>
                  <span>Machinery inventory and operations</span>
                </div>
                <div className={styles.productFeature}>
                  <span className={styles.productFeatureIcon}>🌾</span>
                  <span>Harvest, storage and logistics</span>
                </div>
                <div className={styles.productFeature}>
                  <span className={styles.productFeatureIcon}>💰</span>
                  <span>Finance and crop-cycle profitability</span>
                </div>
              </div>
              <div className={styles.sectionCta}>
                <Button href="/product" variant="primary" size="lg">
                  Explore the Interactive Product
                </Button>
              </div>
            </div>
            <div className={styles.productPreview}>
              <div className={styles.productPreviewFrame}>
                <div className={styles.productPreviewBar}>
                  <span className={styles.productPreviewDot} />
                  <span className={styles.productPreviewDot} />
                  <span className={styles.productPreviewDot} />
                </div>
                <div className={styles.productPreviewContent}>
                  <div className={styles.productPreviewSidebar} />
                  <div className={styles.productPreviewMain}>
                    <div className={styles.productPreviewStat} />
                    <div className={styles.productPreviewStat} />
                    <div className={styles.productPreviewStat} />
                    <div className={styles.productPreviewTable} />
                    <div className={styles.productPreviewTable} />
                  </div>
                </div>
              </div>
              <p className={styles.productPreviewCaption}>
                VAN Product — Interactive farm operations dashboard
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 5 — THE PHYSICAL WORLD BEHIND VAN */}
      <Section variant="dark">
        <div className="container">
          <div className={styles.worldIntro}>
            <div>
              <span className="eyebrow" style={{ color: "rgba(238,242,236,0.5)" }}>The physical world</span>
              <h2 className={styles.sectionTitle} style={{ color: "var(--text-on-dark)" }}>
                See the world VAN is building.
              </h2>
              <p className={styles.sectionLead} style={{ color: "rgba(238,242,236,0.65)" }}>
                Explore an interactive 3D representation of VAN's agricultural
                operation — from fields and machinery to processing facilities,
                storage and market infrastructure.
              </p>
              <div className={styles.worldModes}>
                <div className={styles.worldMode}>
                  <h3 className={styles.worldModeTitle}>Explore the World</h3>
                  <p className={styles.worldModeText}>
                    Free navigation and inspection of agricultural infrastructure.
                    Click on buildings, machinery and fields to understand their role.
                  </p>
                </div>
                <div className={styles.worldMode}>
                  <h3 className={styles.worldModeTitle}>Experience the Journey</h3>
                  <p className={styles.worldModeText}>
                    Follow a crop through the entire six-stage agricultural
                    operation — from soil assessment to market delivery.
                  </p>
                </div>
              </div>
              <div className={styles.sectionCta}>
                <Button href="/journey" variant="onDark" size="lg">
                  Enter the 3D Experience
                </Button>
              </div>
            </div>
            <div className={styles.worldPreview}>
              <div className={styles.worldPreviewFrame}>
                <div className={styles.worldPreviewScene}>
                  <div className={styles.worldPreviewField} />
                  <div className={styles.worldPreviewField} />
                  <div className={styles.worldPreviewField} />
                  <div className={styles.worldPreviewBuilding} />
                  <div className={styles.worldPreviewBuilding} />
                  <div className={styles.worldPreviewRoad} />
                </div>
              </div>
              <p className={styles.worldPreviewCaption}>
                Interactive 3D agricultural environment
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 6 — CONNECTED PRODUCT AND PHYSICAL OPERATIONS */}
      <Section>
        <div className="container">
          <span className="eyebrow">Connected system</span>
          <h2 className={styles.sectionTitle}>One farm. One connected system.</h2>
          <p className={styles.sectionLead}>
            VAN's software coordinates the company's physical agricultural
            operations. The product dashboard and the 3D world represent the
            same farm, the same fields, and the same operational records.
          </p>
          <div className={styles.splitDemo}>
            <div className={styles.splitPanel}>
              <div className={styles.splitPanelLabel}>VAN Product</div>
              <div className={styles.splitPanelContent}>
                <div className={styles.splitPanelStat}>Field: North Field</div>
                <div className={styles.splitPanelStat}>Crop: Wheat</div>
                <div className={styles.splitPanelStat}>Stage: Growing</div>
                <div className={styles.splitPanelStat}>Area: 5 hectares</div>
              </div>
              <Link href="/product" className={styles.splitPanelLink}>
                Open in Product →
              </Link>
            </div>
            <div className={styles.splitConnector}>
              <span className={styles.splitConnectorText}>Same data</span>
            </div>
            <div className={styles.splitPanel}>
              <div className={styles.splitPanelLabel}>VAN 3D World</div>
              <div className={styles.splitPanelContent}>
                <div className={styles.splitPanel3D}>
                  <div className={styles.splitPanel3DField} />
                  <div className={styles.splitPanel3DTractor} />
                  <div className={styles.splitPanel3DCrop} />
                </div>
              </div>
              <Link href="/journey" className={styles.splitPanelLink}>
                Explore in 3D →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 7 — WHO VAN SERVES */}
      <Section>
        <div className="container">
          <span className="eyebrow">Our ecosystem</span>
          <h2 className={styles.sectionTitle}>Built around the people who grow our food.</h2>
          <p className={styles.sectionLead}>
            VAN's intended primary customers are independent, small and
            medium-sized and family-owned farms. VAN also works with the
            businesses and organisations that support agricultural operations.
          </p>
          <div className={styles.audienceGrid}>
            {AUDIENCES.map((item) => (
              <div key={item.title} className={styles.audienceItem}>
                <h3 className={styles.audienceTitle}>{item.title}</h3>
                <p className={styles.audienceText}>{item.text}</p>
                <Link href={item.link.href} className={styles.textLink}>
                  {item.link.label}
                </Link>
              </div>
            ))}
          </div>
          <div className={styles.audienceNote}>
            <p>
              Farmers retain ownership of their land and control of their farm
              businesses. VAN provides and manages the infrastructure, products
              and services it offers.
            </p>
          </div>
        </div>
      </Section>

      {/* SECTION 8 — TECHNOLOGY AND LAND INTELLIGENCE */}
      <Section variant="dark">
        <div className="container">
          <span className="eyebrow" style={{ color: "rgba(238,242,236,0.5)" }}>Technology</span>
          <h2 className={styles.sectionTitle} style={{ color: "var(--text-on-dark)" }}>
            Technology should make real work happen.
          </h2>
          <p className={styles.sectionLead} style={{ color: "rgba(238,242,236,0.65)" }}>
            VAN uses technology to support agricultural operations, not replace
            the knowledge and experience of farmers.
          </p>
          <div className={styles.techGrid}>
            <div className={styles.techItem}>
              <h3 className={styles.techTitle}>Field mapping and boundaries</h3>
              <p className={styles.techText}>
                Digital field maps with accurate boundaries, area measurements
                and spatial relationships between fields.
              </p>
            </div>
            <div className={styles.techItem}>
              <h3 className={styles.techTitle}>Soil measurements and assessment</h3>
              <p className={styles.techText}>
                Soil fertility assessment relies on soil sampling and laboratory
                or validated sensing methods, with remote sensing providing
                complementary spatial information.
              </p>
            </div>
            <div className={styles.techItem}>
              <h3 className={styles.techTitle}>Satellite and remote sensing</h3>
              <p className={styles.techText}>
                Satellite imagery helps map fields, examine vegetation and
                identify spatial changes — it does not independently provide
                laboratory-grade soil fertility assessment.
              </p>
            </div>
            <div className={styles.techItem}>
              <h3 className={styles.techTitle}>Weather and field observations</h3>
              <p className={styles.techText}>
                Weather data and field observations inform operational decisions,
                from planting timing to irrigation scheduling.
              </p>
            </div>
            <div className={styles.techItem}>
              <h3 className={styles.techTitle}>Machinery data and operations</h3>
              <p className={styles.techText}>
                Connected machinery and operational records provide visibility
                into equipment status, activity and maintenance needs.
              </p>
            </div>
            <div className={styles.techItem}>
              <h3 className={styles.techTitle}>Farm records and software</h3>
              <p className={styles.techText}>
                The VAN product coordinates all operational data — from soil
                assessments to financial records — in one connected system.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 9 — COMPANY VISION */}
      <Section>
        <div className="container">
          <div className={styles.visionWrap}>
            <span className="eyebrow">Our vision</span>
            <h2 className={styles.visionTitle}>
              An agricultural company built for the entire journey.
            </h2>
            <p className={styles.visionText}>
              VAN is building an integrated agricultural operating company that
              farmers can rely on throughout the agricultural cycle. We intend
              to own, lease, procure and operate important parts of the
              agricultural value chain — bringing the resources, machinery,
              operations and infrastructure farmers need into one connected system.
            </p>
            <p className={styles.visionText}>
              This is not a marketplace that connects farmers with external
              service listings. This is not a farm management SaaS application.
              VAN is building the physical and digital infrastructure for
              agricultural operations.
            </p>
            <div className={styles.sectionCta}>
              <Button href="/company" variant="primary" size="lg">
                Learn About VAN
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 10 — FINAL CALL TO ACTION */}
      <Section variant="dark">
        <div className="container">
          <div className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              Let's build a better connected agricultural future.
            </h2>
            <p className={styles.finalCtaText}>
              Whether you're a farmer interested in early access, a supplier
              looking to partner, or an organisation exploring how VAN can
              support agricultural operations — we'd like to hear from you.
            </p>
            <div className={styles.finalCtaActions}>
              <Button href="/contact" variant="onDark" size="lg">
                Discuss a Pilot with VAN
              </Button>
              <Button href="/product" variant="outlineDark" size="lg">
                Explore the Product
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
