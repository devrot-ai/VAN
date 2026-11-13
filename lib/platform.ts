export type Pillar = {
  slug: string;
  index: string;
  name: string;
  short: string;
  card: string;
  accent: "field" | "harvest" | "green";
  problem: { lead: string; pains: string[] };
  how: { title: string; points: string[] };
  who: string[];
  workflows: string[];
  connects: string;
  longterm: string;
};

export const PILLARS: Pillar[] = [
  {
    slug: "farm-intelligence",
    index: "01",
    name: "Farm intelligence",
    short: "See every field clearly",
    card:
      "Field boundaries, crop records, soil and weather insights — a living record of every acre you farm.",
    accent: "field",
    problem: {
      lead:
        "Knowledge about a farm lives in spreadsheets, memory, old maps and logbooks. When a decision arrives — what to plant, when to irrigate, when to harvest — the facts are scattered.",
      pains: [
        "Field records kept in notebooks that only one person can read",
        "No single view of what is planted where, and what has already happened",
        "Weather and soil conditions rarely connected to day-to-day decisions",
      ],
    },
    how: {
      title: "One record for every field",
      points: [
        "Draw or import field boundaries and keep a structured history of each field",
        "Record crops, varieties, planting, inputs and operations against the field",
        "Layer weather, irrigation and soil observations onto the same map",
        "Surface field-level insights as plain-language notes you can act on",
      ],
    },
    who: ["Farm owners and managers", "Agronomists and consultants", "Cooperatives managing many farms"],
    workflows: ["Mapping fields", "Planning crop cycles", "Logging operations", "Reviewing field history"],
    connects:
      "Field records feed the rest of VAN: crops drive harvest planning, operation logs become history, and insights inform machinery and labour decisions.",
    longterm:
      "As validated models and real integrations arrive, intelligence will extend to remote observations and yield estimation — always grounded in your own records, never a black box.",
  },
  {
    slug: "machinery",
    index: "02",
    name: "Machinery & equipment",
    short: "The right machine, when you need it",
    card:
      "Find, compare and book tractors, implements and equipment from owners near you — and run your own fleet better.",
    accent: "harvest",
    problem: {
      lead:
        "Machinery is expensive to own and hard to find when you need it. Owners underuse equipment; farmers lose days waiting for availability by phone.",
      pains: [
        "No clear picture of what equipment exists nearby, and whether it’s free",
        "Pricing is opaque — quotes arrive late and differ wildly",
        "Owners juggle bookings across calls, texts and paper diaries",
      ],
    },
    how: {
      title: "A market for machine time",
      points: [
        "Equipment owners list machines with photos, specs, pricing and service areas",
        "Search and filter by type, location and availability; compare rates side by side",
        "Request a booking with dates and scope; owners accept or decline in one place",
        "Track the job from booking to completion, with evidence and history",
      ],
    },
    who: ["Independent farmers", "Machinery owners and dealers", "Contract operators"],
    workflows: ["Listing equipment", "Searching & comparing", "Requesting bookings", "Running a hire out"],
    connects:
      "Machinery talks to harvest planning (you book what a harvest needs), services (operators), and finance (income and costs flow into your books).",
    longterm:
      "Telemetry on connected machines will add live utilisation, service reminders and fair, data-backed pricing to the same marketplace.",
  },
  {
    slug: "services",
    index: "03",
    name: "People & services",
    short: "The right person, at the right time",
    card:
      "Find workers, operators, contractors, agronomists and technicians — with profiles, jobs and clear ways to get work done.",
    accent: "green",
    problem: {
      lead:
        "Finding reliable labour and specialist help is one of farming’s oldest bottlenecks. People are hired by word of mouth, availability is unknown, and jobs are tracked nowhere.",
      pains: [
        "Hard to find people with the exact skills a job needs, when they’re free",
        "No shared record of who did what, when, and how well",
        "Coordination across many providers happens by phone and guesswork",
      ],
    },
    how: {
      title: "A dependable labour and services layer",
      points: [
        "Providers build profiles with skills, categories, locations, pricing and availability",
        "Post or request jobs; receive matched, qualified leads",
        "Assign work, track status and record completion with evidence",
        "Build a trusted history of who you can rely on",
      ],
    },
    who: ["Farmers needing help", "Contractors, operators, technicians", "Agricultural consultants"],
    workflows: ["Posting a job", "Finding help", "Tracking work", "Recording completion"],
    connects:
      "Service jobs bundle naturally with machinery bookings and harvest logistics, and their costs and earnings flow into finance and commerce.",
    longterm:
      "Teams and reputations grow on the platform, so cooperatives can coordinate a shared labour pool across all their member farms.",
  },
  {
    slug: "harvest-logistics",
    index: "04",
    name: "Harvest & logistics",
    short: "From field to buyer, without the chaos",
    card:
      "Plan harvests, coordinate crews and equipment, book transport and storage, and connect with buyers in one flow.",
    accent: "field",
    problem: {
      lead:
        "Harvest is a narrow window where everything must align: crops, crews, machines, transport, storage and buyers. When they don’t, produce is lost or sold at the wrong price.",
      pains: [
        "Harvest plans sit in heads and notes, not in one coordinated schedule",
        "Transport and storage are booked last-minute, often too late",
        "Produce moves with little documentation or connection to buyers",
      ],
    },
    how: {
      title: "A coordinated harvest, end to end",
      points: [
        "Plan harvest lots against crop cycles and field records",
        "Reserve the equipment and labour your harvest needs, ahead of time",
        "Book transport and warehouse space, and record loads as they move",
        "Connect produce to buyers and keep delivery records",
      ],
    },
    who: ["Farm managers", "Harvest crews and contractors", "Buyers and warehouses"],
    workflows: ["Planning harvests", "Coordinating resources", "Loading & transport", "Delivering to buyers"],
    connects:
      "Harvest planning reads from farm intelligence, pulls from machinery and services, and feeds sales and payments in commerce.",
    longterm:
      "Delivery and lot records become a shared, trustworthy provenance trail for every load, from field to buyer.",
  },
  {
    slug: "finance-commerce",
    index: "05",
    name: "Finance & commerce",
    short: "Your farm’s money, connected",
    card:
      "Track expenses, purchases, sales, payments and profitability — so you always know where the farm stands.",
    accent: "harvest",
    problem: {
      lead:
        "Farms run on thin margins, yet most don’t have a clear, current picture of what they earn and spend. Money moves across many suppliers, sales and seasons.",
      pains: [
        "Expenses and income scattered across accounts, receipts and memory",
        "Almost impossible to see which enterprise or field actually makes money",
        "Payments and receivables tracked in personal notes",
      ],
    },
    how: {
      title: "A clear, connected financial record",
      points: [
        "Log farm expenses and input purchases against the right field or enterprise",
        "Keep a supplier directory and a record of every sale",
        "See payment history and outstanding receivables at a glance",
        "Review profitability summaries by field, crop and season",
      ],
    },
    who: ["Farm owners", "Family-run businesses", "Cooperatives managing shared finances"],
    workflows: ["Recording expenses", "Purchasing inputs", "Recording sales", "Reviewing profitability"],
    connects:
      "Finance draws transactions from machinery bookings, service jobs and harvest sales automatically, so your books stay current without re-keying.",
    longterm:
      "A trusted ledger of farm activity will support fair access to credit, insurance and input financing.",
  },
  {
    slug: "connected-hardware",
    index: "06",
    name: "Connected hardware",
    short: "Devices that report home",
    card:
      "Register your sensors and machines, see live status and telemetry, and get alerts — when real integrations exist.",
    accent: "green",
    problem: {
      lead:
        "Farms are full of valuable hardware — sensors, pumps, machines, weather stations — each with its own app or no connection at all. Data is locked away or simply lost.",
      pains: [
        "Devices from different makers don’t talk to one another",
        "Status is only visible by physically checking",
        "Alerts arrive too late or not at all",
      ],
    },
    how: {
      title: "One home for your devices",
      points: [
        "Register devices once; keep a clean inventory of what you run",
        "See device status and alerts in the same place as your farm",
        "Connect telemetry to the right field or machine",
        "Start small — a single sensor or machine — and grow",
      ],
    },
    who: ["Farmers with connected equipment", "Machinery owners", "Irrigation and climate sensors"],
    workflows: ["Registering devices", "Monitoring status", "Viewing telemetry", "Receiving alerts"],
    connects:
      "Device alerts and telemetry land directly in your farm feed, alongside weather, field and booking information.",
    longterm:
      "VAN becomes the neutral home for all your hardware — whatever the brand — feeding one coherent picture of your operation.",
  },
];

export function pillarBySlug(slug: string) {
  return PILLARS.find((p) => p.slug === slug);
}
