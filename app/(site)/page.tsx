import Link from "next/link";
import Button from "@/components/ui/Button";
import Section, { SectionHeading } from "@/components/ui/Section";
import { PillarRows } from "@/components/site/PillarRow";
import EarlyAccessForm from "@/components/site/EarlyAccessForm";
import Model3D from "@/components/site/Model3D";
import { PILLARS } from "@/lib/platform";
import styles from "./home.module.css";

const PAINS = [
  {
    title: "Disconnected apps",
    text: "A farmer may juggle a bookkeeping tool, a mapping service, a machinery marketplace, messaging apps and paper — none of which talk to each other.",
  },
  {
    title: "Information scattered",
    text: "Field history, equipment availability, labour and finances live in different places, so good decisions take days of detective work.",
  },
  {
    title: "Everything re-keyed",
    text: "The same facts are typed over and over into different systems, creating errors and wasting the hours a farm can’t spare.",
  },
];

const SEASON = [
  {
    phase: "Plan",
    season: "Winter",
    text: "Map fields, set crop cycles and line up finance for the year ahead.",
    pillars: "Intelligence · Finance",
  },
  {
    phase: "Prepare",
    season: "Spring",
    text: "Book machinery and services, and schedule the work across your fields.",
    pillars: "Machinery · Services",
  },
  {
    phase: "Grow",
    season: "Spring–Summer",
    text: "Log operations and watch field, weather and soil insights accumulate.",
    pillars: "Intelligence · Hardware",
  },
  {
    phase: "Harvest",
    season: "Autumn",
    text: "Coordinate crews, equipment and transport, and plan lots for sale.",
    pillars: "Harvest · Logistics",
  },
  {
    phase: "Sell",
    season: "Autumn–Winter",
    text: "Record sales and payments, and review what the season really returned.",
    pillars: "Finance · Commerce",
  },
];

const AUDIENCES = [
  {
    eyebrow: "For farmers",
    title: "Run the whole farm from one place",
    text: "See every field, book the equipment and people you need, plan your harvest and know your numbers — without stitching together five tools.",
    links: [
      { label: "See VAN for farmers", href: "/for-farmers" },
      { label: "Explore the platform", href: "/platform" },
    ],
  },
  {
    eyebrow: "For equipment owners",
    title: "Make your machines work harder",
    text: "List your equipment once, get booking requests with clear terms, and build a dependable stream of work and income.",
    links: [
      { label: "See VAN for providers", href: "/for-providers" },
      { label: "Machinery pillar", href: "/platform/machinery" },
    ],
  },
  {
    eyebrow: "For agricultural businesses",
    title: "Coordinate across farms and services",
    text: "Cooperatives and service businesses manage members, field access, shared bookings and clear activity summaries in one governed place.",
    links: [
      { label: "See VAN for cooperatives", href: "/for-cooperatives" },
      { label: "Services pillar", href: "/platform/services" },
    ],
  },
];

const HARDWARE = [
  { title: "One home for your devices", text: "Register sensors, pumps and machines once, and see them in the same place as your farm." },
  { title: "Status and alerts", text: "Get device status and timely alerts where you already look — your farm overview." },
  { title: "Telemetry that connects", text: "Device readings attach to the right field and machine, building context over time." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">The agricultural operating platform</span>
            <h1 className={styles.heroTitle}>
              The whole farm, held in{" "}
              <em className={styles.heroAccent}>one record.</em>
            </h1>
            <p className={styles.heroLead}>
              Fields and crops, machinery and people, harvest and money — VAN
              keeps the season together in a single connected record, from
              first planning to final sale.
            </p>
            <div className={styles.heroCta}>
              <Button href="/platform" variant="primary" size="lg">
                Explore the platform
              </Button>
              <Link href="/early-access" className={styles.heroLink}>
                Join the early-access list →
              </Link>
            </div>
            <p className={styles.heroFoot}>
              Early access · no payment, no commitment
            </p>
          </div>

          <figure className={styles.figure}>
            <FieldPlan />
            <figcaption className={styles.figureCaption}>
              <span className={styles.figureIndex}>Fig. 1</span>
              The whole farm on one sheet — fields, crops and status in a
              single record (illustration).
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The problem */}
      <Section className="surface-raise">
        <div className="container">
          <SectionHeading
            eyebrow="The problem"
            title="Farming shouldn’t require a dozen disconnected tools."
            lead="Today a serious farm is run across spreadsheets, apps, books, calls and memory. VAN exists to end that fragmentation."
          />
          <div className={styles.painGrid}>
            {PAINS.map((p, i) => (
              <div key={p.title} className={styles.painItem}>
                <span className={styles.painIndex}>{`0${i + 1}`}</span>
                <h3 className={styles.painTitle}>{p.title}</h3>
                <p className="muted">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Six pillars — the register */}
      <Section>
        <div className="container">
          <div className={styles.sectionBar}>
            <span className="eyebrow">The platform</span>
            <span className={styles.sectionBarNote}>
              Six connected pillars · one record
            </span>
          </div>
          <h2 className={styles.pillarTitle}>
            The pillars, entered as they stand.
          </h2>
          <p className={styles.pillarLead}>
            Each entry solves a real, everyday farming problem — and every one
            is kept connected to the rest.
          </p>
          <PillarRows pillars={PILLARS} />
        </div>
      </Section>

      {/* How they connect */}
      <Section className="surface-dark">
        <div className="container">
          <SectionHeading
            eyebrow="Connected by design"
            title="One action flows into the next."
            lead="A field record feeds a harvest plan, which books the machinery and crew, which shows up in your finances. Nothing is an island."
            dark
          />
          <div className={styles.connectGrid}>
            {PILLARS.map((p, i) => (
              <div key={p.slug} className={styles.connectCell}>
                <span className={styles.connectIndex}>{p.index}</span>
                <span className={styles.connectName}>{p.short}</span>
                <span className={styles.connectNext}>
                  {i < PILLARS.length - 1
                    ? `→ flows to 0${i + 2}`
                    : "→ telemetry returns to 01"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* The year — one working pipeline maquette */}
      <Section id="pipeline">
        <div className="container">
          <SectionHeading
            eyebrow="The VAN workflow"
            title="From field record to final sale."
            lead="A draggable scale model of the complete operation — five working phases joined by one farm road. Field intelligence, machinery, services, harvest, finance and connected hardware all write to the same record."
          />
          <div className={styles.pipelineWrap}>
            <figure className={styles.pipelineFig}>
              <Model3D kind="pipeline" />
              <figcaption className={styles.figureCaption}>
                <span className={styles.figureIndex}>Fig. 2</span>
                The farm year as one working model — five zones, one road, one
                record.
              </figcaption>
            </figure>
          </div>
          <ol className={styles.legendGrid}>
            {SEASON.map((s, i) => (
              <li key={s.phase} className={styles.legendItem}>
                <div className={styles.legendHead}>
                  <span className={styles.legendIndex}>{`0${i + 1}`}</span>
                  <span className={styles.legendPhase}>{s.phase}</span>
                  <span className={styles.legendSeason}>{s.season}</span>
                </div>
                <p className={styles.legendText}>{s.text}</p>
                <span className={styles.legendPillars}>{s.pillars}</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Value props */}
      <Section className="surface-raise">
        <div className="container">
          <div className={styles.audienceGrid}>
            {AUDIENCES.map((a, i) => (
              <div key={a.eyebrow} className={styles.audienceItem}>
                <span className={styles.audienceIndex}>{`0${i + 1}`}</span>
                <span className="eyebrow">{a.eyebrow}</span>
                <h3 className={styles.audienceTitle}>{a.title}</h3>
                <p className="muted">{a.text}</p>
                <div className={styles.audienceLinks}>
                  {a.links.map((l) => (
                    <Link key={l.href} href={l.href} className={styles.textLink}>
                      {l.label} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Hardware + intelligence vision */}
      <Section className="surface-dark">
        <div className="container">
          <div className={styles.hardwareWrap}>
            <div>
              <SectionHeading
                eyebrow="Connected hardware & intelligence"
                title="A neutral home for your devices and data."
                lead="VAN connects to the hardware already on your farm and turns years of scattered information into a coherent picture — grounding every decision in real records."
                dark
              />
              <div className={styles.hardwareList}>
                {HARDWARE.map((h, i) => (
                  <div key={h.title} className={styles.hardwareItem}>
                    <span className={styles.hardwareIndex}>{`0${i + 1}`}</span>
                    <h3 className={styles.hardwareTitle}>{h.title}</h3>
                    <p className={styles.hardwareText}>{h.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Global ambition */}
      <Section>
        <div className="container container--narrow">
          <SectionHeading
            eyebrow="A global ambition"
            title="One operating standard for independent farming."
            lead="VAN is being built to serve independent farmers, family farms, machinery owners, contractors, cooperatives and buyers across many countries — with one consistent, trustworthy core."
            align="center"
          />
          <p className={styles.globalText}>
            The same connected record that helps a single farm plan its season can help a
            cooperative coordinate dozens of farms, and help a buyer trust where a load
            came from. We’re starting local and building a foundation that scales globally.
          </p>
        </div>
      </Section>

      {/* Early access */}
      <Section className="surface-raise" id="early-access">
        <div className="container">
          <div className={styles.earlyWrap}>
            <div className={styles.earlyCopy}>
              <span className="eyebrow">Early access</span>
              <h2 className={styles.earlyTitle}>
                Be among the first farms on VAN.
              </h2>
              <p className="muted">
                Join the early-access list to get priority onboarding, shape the
                roadmap, and be first to try the platform in your region.
              </p>
              <ul className={styles.earlyPoints}>
                <li>Priority onboarding in your region</li>
                <li>A direct line to the people building VAN</li>
                <li>Your needs become our roadmap</li>
              </ul>
            </div>
            <div className={styles.earlyForm}>
              <div className={styles.earlyFormBar}>
                Register your interest
              </div>
              <div className={styles.earlyFormBody}>
                <EarlyAccessForm />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* Fig. 1 — a drawn farm plan in the ledger palette: flat inks, hairline
   parcel outlines, crop-row textures and one farm road. Pure SVG, no
   gradients or shadows; every label is drawn in AA-safe ink. */
const INK = "#173d32";
const FIELD = "#b7c9a8";
const FIELD_LIGHT = "#cdd8ba";
const FIELD_PALE = "#e7ead9";
const HARVEST_SOFT = "#e9c79a";
const PLAN_ROAD = "#ded5c0";
const PLAN_STREAM = "#9fb8b1";

function FieldPlan() {
  return (
    <svg
      className={styles.planSvg}
      viewBox="0 0 460 340"
      role="img"
      aria-label="Illustration: a farm record sheet showing four fields — winter wheat, barley, maize and a resting pasture — arranged around one farm road"
    >
      <rect width="460" height="340" fill="#f7f7f2" />

      {/* sheet ruling */}
      <g stroke="#173d32" strokeOpacity="0.05" strokeWidth="1">
        <line x1="12" y1="36" x2="448" y2="36" />
        <line x1="12" y1="72" x2="448" y2="72" />
        <line x1="12" y1="108" x2="448" y2="108" />
        <line x1="12" y1="144" x2="448" y2="144" />
        <line x1="12" y1="180" x2="448" y2="180" />
        <line x1="12" y1="252" x2="448" y2="252" />
        <line x1="12" y1="288" x2="448" y2="288" />
        <line x1="12" y1="324" x2="448" y2="324" />
      </g>

      {/* stream — runs under the road, along the right margin */}
      <path
        d="M452 12 C450 80 446 140 448 200 C450 260 446 300 444 328"
        fill="none"
        stroke={PLAN_STREAM}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* parcels */}
      <path
        d="M24 20 L212 26 L218 198 L28 198 Z"
        fill={FIELD}
        stroke="#173d32"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <path
        d="M250 24 L436 30 L442 198 L256 198 Z"
        fill={HARVEST_SOFT}
        stroke="#173d32"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <path
        d="M30 242 L234 240 L240 318 L38 318 Z"
        fill={FIELD_PALE}
        stroke="#173d32"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <path
        d="M266 242 L392 240 L390 318 L274 318 Z"
        fill={FIELD_LIGHT}
        stroke="#173d32"
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {/* farm road across the front */}
      <rect x="0" y="206" width="460" height="26" fill={PLAN_ROAD} />
      <line
        x1="0"
        y1="219"
        x2="460"
        y2="219"
        stroke="#b9ad92"
        strokeWidth="1.5"
        strokeDasharray="10 8"
      />

      {/* crop-row textures */}
      <g
        stroke="#8faa7d"
        strokeWidth="1.4"
        opacity="0.75"
        fill="none"
      >
        <path d="M52 118v28M84 114v32M116 112v34M148 114v32M180 112v34" />
        <path d="M52 160v24M84 158v26M116 156v28M148 158v26M180 156v28" />
      </g>
      <g
        stroke="#b98d52"
        strokeWidth="1.4"
        strokeDasharray="3 7"
        opacity="0.85"
        fill="none"
      >
        <path d="M292 120h96M292 140h112M292 160h104M292 180h96" />
      </g>
      <g stroke="#c2c9ae" strokeWidth="1.4" fill="none" opacity="0.9">
        <path d="M60 254h34M104 258h30M148 254h32" />
      </g>
      <g stroke="#7d9a6c" strokeWidth="1.3" opacity="0.8" fill="none">
        <path d="M334 252v14M352 250v16M370 252v14" />
      </g>

      {/* field labels — name + working state, in ledger ink */}
      <text x="46" y="72" fontSize="12" fontWeight="700" fill={INK}>
        North Field
      </text>
      <text
        x="46"
        y="86"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="0.8"
        fill={INK}
      >
        WINTER WHEAT · 42 HA · GROWING
      </text>
      <text x="266" y="72" fontSize="12" fontWeight="700" fill={INK}>
        Hilltop
      </text>
      <text
        x="266"
        y="86"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="0.8"
        fill={INK}
      >
        BARLEY · 19 HA · PLANTED
      </text>
      <text x="50" y="272" fontSize="12" fontWeight="700" fill={INK}>
        South Pasture
      </text>
      <text
        x="50"
        y="286"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="0.8"
        fill={INK}
      >
        PASTURE · 34 HA · FALLOW
      </text>
      <text x="286" y="274" fontSize="12" fontWeight="700" fill={INK}>
        Riverside
      </text>
      <text
        x="286"
        y="288"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="0.8"
        fill={INK}
      >
        MAIZE · 28 HA
      </text>
      <text
        x="286"
        y="300"
        fontSize="8.5"
        fontWeight="600"
        letterSpacing="0.8"
        fill={INK}
      >
        GROWING
      </text>

      {/* scale bar */}
      <g stroke={INK} strokeWidth="1">
        <line x1="196" y1="330" x2="264" y2="330" />
        <line x1="196" y1="327" x2="196" y2="333" />
        <line x1="230" y1="328" x2="230" y2="332" />
        <line x1="264" y1="327" x2="264" y2="333" />
      </g>
      <text x="272" y="333" fontSize="8" fontWeight="600" fill={INK}>
        100 M
      </text>
    </svg>
  );
}
