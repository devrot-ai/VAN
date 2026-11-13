/**
 * VAN Agricultural Simulation — Demo Data
 *
 * All records are fictional and for demonstration only.
 */
import type {
  DemoFarmer,
  DemoFarm,
  DemoField,
  LandAssessment,
  InputInventory,
  EquipmentAsset,
  WorkerTeam,
  FarmOperation,
  HarvestLot,
  StorageRecord,
  Shipment,
  FinancialTransaction,
  StageInfo,
  WorldLocation,
  JourneySubStep,
} from "./types";

// ─── Farmer & Farm ───────────────────────────────────────────────

export const demoFarmer: DemoFarmer = {
  id: "farmer-001",
  name: "Amara Okafor",
  language: "en",
  contact: "demo@van.agri",
  farmIds: ["farm-001"],
};

export const demoFarm: DemoFarm = {
  id: "farm-001",
  name: "Green Valley Farm",
  location: "Illustrative Region, Demo Country",
  area: 120,
  unit: "ha",
  fieldIds: ["field-001", "field-002", "field-003"],
};

export const demoFields: DemoField[] = [
  {
    id: "field-001",
    farmId: "farm-001",
    name: "North Field",
    area: 45,
    unit: "ha",
    crop: "wheat",
    cropStage: "mature",
    assessmentId: "assess-001",
    activityIds: ["op-001", "op-002", "op-003"],
  },
  {
    id: "field-002",
    farmId: "farm-001",
    name: "East Field",
    area: 35,
    unit: "ha",
    crop: "maize",
    cropStage: "growing",
    assessmentId: "assess-002",
    activityIds: ["op-004"],
  },
  {
    id: "field-003",
    farmId: "farm-001",
    name: "South Field",
    area: 40,
    unit: "ha",
    crop: "soybean",
    cropStage: "planted",
    assessmentId: "assess-003",
    activityIds: ["op-005"],
  },
];

// ─── Land Assessments ────────────────────────────────────────────

export const demoAssessments: LandAssessment[] = [
  {
    id: "assess-001",
    fieldId: "field-001",
    soilTestStatus: "completed",
    ph: 6.5,
    organicCarbon: 3.2,
    nitrogen: 45,
    phosphorus: 28,
    potassium: 180,
    moisture: 22,
    texture: "loam",
    drainage: "good",
    compaction: "light",
    suitability: ["wheat", "barley", "canola"],
    evidenceSource: "lab",
    testDate: "2025-10-15",
  },
  {
    id: "assess-002",
    fieldId: "field-002",
    soilTestStatus: "completed",
    ph: 6.8,
    organicCarbon: 2.8,
    nitrogen: 38,
    phosphorus: 32,
    potassium: 160,
    moisture: 25,
    texture: "silty",
    drainage: "moderate",
    compaction: "none",
    suitability: ["maize", "sorghum", "soybean"],
    evidenceSource: "lab",
    testDate: "2025-10-18",
  },
  {
    id: "assess-003",
    fieldId: "field-003",
    soilTestStatus: "pending",
    ph: null,
    organicCarbon: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    moisture: null,
    texture: null,
    drainage: null,
    compaction: null,
    suitability: [],
    evidenceSource: "none",
    testDate: null,
  },
];

// ─── Input Inventory ─────────────────────────────────────────────

export const demoInputs: InputInventory[] = [
  {
    id: "input-001",
    name: "Wheat Seed — Variety KWS",
    category: "seed",
    quantity: 2250,
    unit: "kg",
    warehouse: "Main Seed Depot",
    stockStatus: "in-stock",
    intendedApplication: "North Field wheat planting",
    supplier: "VAN Seed Supply",
  },
  {
    id: "input-002",
    name: "NPK 15-15-15 Fertiliser",
    category: "fertiliser",
    quantity: 12000,
    unit: "kg",
    warehouse: "Fertiliser Warehouse",
    stockStatus: "in-stock",
    intendedApplication: "All fields — base fertilisation",
    supplier: "VAN Agri-Chem",
  },
  {
    id: "input-003",
    name: "Maize Seed — Hybrid P10",
    category: "seed",
    quantity: 800,
    unit: "kg",
    warehouse: "Main Seed Depot",
    stockStatus: "low",
    intendedApplication: "East Field maize replant",
    supplier: "VAN Seed Supply",
  },
  {
    id: "input-004",
    name: "Drip Irrigation Kits",
    category: "irrigation",
    quantity: 40,
    unit: "sets",
    warehouse: "Irrigation Store",
    stockStatus: "in-stock",
    intendedApplication: "South Field irrigation setup",
    supplier: "AquaFlow Systems",
  },
  {
    id: "input-005",
    name: "Herbicide — Glyphosate 48%",
    category: "crop-protection",
    quantity: 500,
    unit: "litres",
    warehouse: "Crop Protection Store",
    stockStatus: "in-stock",
    intendedApplication: "Pre-plant weed control",
    supplier: "CropGuard Ltd",
  },
];

// ─── Equipment Fleet ─────────────────────────────────────────────

export const demoEquipment: EquipmentAsset[] = [
  {
    id: "eq-001",
    name: "John Deere 8R 410",
    type: "tractor",
    manufacturer: "John Deere",
    model: "8R 410",
    status: "deployed",
    location: "North Field",
    hoursUsed: 1240,
    maintenanceStatus: "current",
    ownershipType: "owned",
    assignedField: "field-001",
    currentActivity: "Harvest support",
  },
  {
    id: "eq-002",
    name: "Claas Lexion 8900",
    type: "combine",
    manufacturer: "Claas",
    model: "Lexion 8900",
    status: "deployed",
    location: "North Field",
    hoursUsed: 860,
    maintenanceStatus: "current",
    ownershipType: "owned",
    assignedField: "field-001",
    currentActivity: "Wheat harvesting",
  },
  {
    id: "eq-003",
    name: "John Deere 784 Sprayer",
    type: "sprayer",
    manufacturer: "John Deere",
    model: "784",
    status: "operational",
    location: "Machinery Yard",
    hoursUsed: 620,
    maintenanceStatus: "due-soon",
    ownershipType: "owned",
    assignedField: null,
    currentActivity: null,
  },
  {
    id: "eq-004",
    name: "Case IH Magnum 340",
    type: "tractor",
    manufacturer: "Case IH",
    model: "Magnum 340",
    status: "operational",
    location: "Machinery Yard",
    hoursUsed: 980,
    maintenanceStatus: "current",
    ownershipType: "leased",
    assignedField: null,
    currentActivity: null,
  },
  {
    id: "eq-005",
    name: "VAN Transport Truck 01",
    type: "truck",
    manufacturer: "MAN",
    model: "TGS 18.500",
    status: "idle",
    location: "Loading Bay",
    hoursUsed: 340,
    maintenanceStatus: "current",
    ownershipType: "owned",
    assignedField: null,
    currentActivity: null,
  },
  {
    id: "eq-006",
    name: "Seed Drill — Vaderstad",
    type: "seed-drill",
    manufacturer: "Vaderstad",
    model: "Joker 450",
    status: "operational",
    location: "Machinery Yard",
    hoursUsed: 450,
    maintenanceStatus: "current",
    ownershipType: "owned",
    assignedField: null,
    currentActivity: null,
  },
  {
    id: "eq-007",
    name: "Irrigation Pump — Grundfos",
    type: "irrigation-pump",
    manufacturer: "Grundfos",
    model: "NO 35-12",
    status: "deployed",
    location: "East Field",
    hoursUsed: 2100,
    maintenanceStatus: "current",
    ownershipType: "owned",
    assignedField: "field-002",
    currentActivity: "Drip irrigation",
  },
];

// ─── Workers & Teams ─────────────────────────────────────────────

export const demoTeams: WorkerTeam[] = [
  {
    id: "team-001",
    name: "Harvest Crew Alpha",
    role: "Harvesting",
    availability: "assigned",
    assignedJobs: ["op-003"],
  },
  {
    id: "team-002",
    name: "Field Operations Team",
    role: "Crop Management",
    availability: "assigned",
    assignedJobs: ["op-004"],
  },
  {
    id: "team-003",
    name: "Logistics Unit",
    role: "Transport & Storage",
    availability: "available",
    assignedJobs: [],
  },
];

// ─── Farm Operations ─────────────────────────────────────────────

export const demoOperations: FarmOperation[] = [
  {
    id: "op-001",
    fieldId: "field-001",
    type: "land-prep",
    scheduledDate: "2025-09-01",
    status: "completed",
    equipmentId: "eq-001",
    teamId: "team-002",
    cost: 2400,
    currency: "USD",
    notes: "Primary tillage completed",
  },
  {
    id: "op-002",
    fieldId: "field-001",
    type: "planting",
    scheduledDate: "2025-09-15",
    status: "completed",
    equipmentId: "eq-006",
    teamId: "team-002",
    cost: 1800,
    currency: "USD",
    notes: "Wheat seeding at 150 kg/ha",
  },
  {
    id: "op-003",
    fieldId: "field-001",
    type: "harvesting",
    scheduledDate: "2025-11-10",
    status: "in-progress",
    equipmentId: "eq-002",
    teamId: "team-001",
    cost: 4200,
    currency: "USD",
    notes: "Wheat harvest — 65% complete",
  },
  {
    id: "op-004",
    fieldId: "field-002",
    type: "irrigation",
    scheduledDate: "2025-11-01",
    status: "in-progress",
    equipmentId: "eq-007",
    teamId: "team-002",
    cost: 900,
    currency: "USD",
    notes: "Drip irrigation cycle 3 of 5",
  },
  {
    id: "op-005",
    fieldId: "field-003",
    type: "planting",
    scheduledDate: "2025-10-20",
    status: "completed",
    equipmentId: "eq-004",
    teamId: "team-002",
    cost: 1500,
    currency: "USD",
    notes: "Soybean planting completed",
  },
];

// ─── Harvest Lots ────────────────────────────────────────────────

export const demoHarvests: HarvestLot[] = [
  {
    id: "harvest-001",
    fieldId: "field-001",
    crop: "wheat",
    quantity: 280,
    unit: "tonnes",
    quality: "premium",
    harvestDate: "2025-11-10",
    processingStatus: "graded",
  },
];

// ─── Storage ─────────────────────────────────────────────────────

export const demoStorage: StorageRecord[] = [
  {
    id: "store-001",
    location: "Silo A",
    harvestLotId: "harvest-001",
    quantity: 150,
    unit: "tonnes",
    storageType: "silo",
    storageDate: "2025-11-12",
  },
  {
    id: "store-002",
    location: "Warehouse B",
    harvestLotId: "harvest-001",
    quantity: 130,
    unit: "tonnes",
    storageType: "warehouse",
    storageDate: "2025-11-12",
  },
];

// ─── Shipments ───────────────────────────────────────────────────

export const demoShipments: Shipment[] = [
  {
    id: "ship-001",
    source: "Warehouse B",
    destination: "Regional Distribution Centre",
    vehicleId: "eq-005",
    quantity: 50,
    unit: "tonnes",
    dispatchStatus: "dispatched",
    deliveryStatus: "pending",
    dispatchDate: "2025-11-13",
    deliveryDate: null,
  },
];

// ─── Financial Transactions ──────────────────────────────────────

export const demoTransactions: FinancialTransaction[] = [
  {
    id: "fin-001",
    category: "input-cost",
    entityId: "input-001",
    description: "Wheat seed purchase",
    amount: -4500,
    currency: "USD",
    status: "settled",
    date: "2025-08-20",
  },
  {
    id: "fin-002",
    category: "input-cost",
    entityId: "input-002",
    description: "NPK fertiliser bulk order",
    amount: -18000,
    currency: "USD",
    status: "settled",
    date: "2025-08-25",
  },
  {
    id: "fin-003",
    category: "machinery-cost",
    entityId: "eq-001",
    description: "Tractor lease payment — Q3",
    amount: -3200,
    currency: "USD",
    status: "settled",
    date: "2025-09-01",
  },
  {
    id: "fin-004",
    category: "labour-cost",
    entityId: "team-001",
    description: "Harvest crew wages — November",
    amount: -8500,
    currency: "USD",
    status: "pending",
    date: "2025-11-13",
  },
  {
    id: "fin-005",
    category: "harvest-cost",
    entityId: "op-003",
    description: "Harvest operation — North Field",
    amount: -4200,
    currency: "USD",
    status: "recorded",
    date: "2025-11-10",
  },
  {
    id: "fin-006",
    category: "storage-cost",
    entityId: "store-001",
    description: "Silo storage — November",
    amount: -1200,
    currency: "USD",
    status: "recorded",
    date: "2025-11-12",
  },
  {
    id: "fin-007",
    category: "transport-cost",
    entityId: "ship-001",
    description: "Truck dispatch — Distribution Centre",
    amount: -800,
    currency: "USD",
    status: "recorded",
    date: "2025-11-13",
  },
  {
    id: "fin-008",
    category: "sales-revenue",
    entityId: "harvest-001",
    description: "Wheat sale — Regional buyer",
    amount: 42000,
    currency: "USD",
    status: "pending",
    date: "2025-11-13",
  },
];

// ─── Journey Stages ──────────────────────────────────────────────

export const journeyStages: StageInfo[] = [
  {
    id: "land-assessment",
    index: "01",
    name: "Understand the Land",
    shortName: "Land Assessment",
    description:
      "Every successful season begins with understanding the land. VAN starts with thorough soil testing, field mapping, and assessment — combining laboratory analysis with field sensors and remote sensing to build a complete picture of each field's potential.",
    whatVANSupplies:
      "Soil sampling kits, laboratory analysis, field mapping tools, and agronomic interpretation of results.",
    whatFarmerReceives:
      "A Field Passport with soil pH, nutrients, moisture, texture, drainage, and crop suitability recommendations.",
    whatIsRecorded:
      "Soil test results, field boundaries, crop history, and suitability assessments — forming the foundation for all subsequent decisions.",
    nextStep: "inputs",
    cameraPosition: [30, 25, 30],
    cameraLookAt: [0, 0, 0],
    subSteps: [
      { id: "field-mapping", name: "Field Mapping", description: "Field boundaries are mapped using GPS and satellite imagery." },
      { id: "soil-sampling", name: "Soil Sampling", description: "Soil samples are collected at key points across the field." },
      { id: "lab-analysis", name: "Laboratory Analysis", description: "Samples are analyzed for pH, nutrients, organic carbon, and texture." },
      { id: "assessment-report", name: "Assessment Report", description: "A Field Passport is generated with recommendations for crop suitability." },
    ],
  },
  {
    id: "inputs",
    index: "02",
    name: "Agricultural Inputs & Procurement",
    shortName: "Inputs",
    description:
      "Based on the land assessment, VAN procures and manages the seeds, fertilisers, crop protection products, and irrigation supplies needed for the season. VAN operates its own input supply chain to ensure quality, availability, and fair pricing.",
    whatVANSupplies:
      "Seeds, fertilisers, crop protection chemicals, soil amendments, irrigation components, and spare parts — sourced and managed by VAN.",
    whatFarmerReceives:
      "The right inputs delivered to the right field at the right time, matched to the soil assessment and crop plan.",
    whatIsRecorded:
      "Input orders, inventory levels, delivery records, and application logs tied to specific fields and operations.",
    nextStep: "machinery",
    cameraPosition: [-30, 20, 30],
    cameraLookAt: [-35, 0, 0],
    subSteps: [
      { id: "input-selection", name: "Input Selection", description: "Seeds and fertilisers are selected based on soil assessment results." },
      { id: "inventory-allocation", name: "Inventory Allocation", description: "Required inputs are allocated from VAN's warehouse inventory." },
      { id: "order-preparation", name: "Order Preparation", description: "A supply order is prepared and staged for delivery." },
      { id: "delivery-to-farm", name: "Delivery to Farm", description: "Inputs are transported from the supply centre to the farm." },
    ],
  },
  {
    id: "machinery",
    index: "03",
    name: "Machinery & Infrastructure",
    shortName: "Machinery",
    description:
      "VAN owns, leases, and operates a fleet of tractors, combines, sprayers, seed drills, and support equipment. Machinery is deployed where needed, maintained on schedule, and tracked for utilisation and efficiency.",
    whatVANSupplies:
      "Tractors, combines, sprayers, seed drills, irrigation pumps, transport trucks, and a maintenance workshop.",
    whatFarmerReceives:
      "Reliable machinery available when needed, with trained operators and scheduled maintenance — no waiting for third-party availability.",
    whatIsRecorded:
      "Equipment status, operating hours, maintenance records, deployment schedules, and utilisation metrics.",
    nextStep: "operations",
    cameraPosition: [0, 20, 35],
    cameraLookAt: [0, 0, 10],
    subSteps: [
      { id: "equipment-selection", name: "Equipment Selection", description: "The right machinery is selected for the planned operation." },
      { id: "operator-assignment", name: "Operator Assignment", description: "Trained operators are assigned to each machine." },
      { id: "machinery-dispatch", name: "Machinery Dispatch", description: "Equipment leaves the yard and travels to the assigned field." },
      { id: "land-preparation", name: "Land Preparation", description: "The field is prepared for planting with tillage and soil conditioning." },
    ],
  },
  {
    id: "operations",
    index: "04",
    name: "Farm Operations & Crop Management",
    shortName: "Operations",
    description:
      "From land preparation through planting, irrigation, fertilisation, and crop protection — VAN coordinates every operation. The growing process is monitored continuously, with field workers, sensors, and weather data feeding real-time decisions.",
    whatVANSupplies:
      "Coordinated field operations, trained crews, irrigation management, crop monitoring, and agronomic guidance.",
    whatFarmerReceives:
      "A managed growing season with operations executed on schedule, crops monitored and protected, and issues addressed promptly.",
    whatIsRecorded:
      "Operation logs, crop growth stages, input applications, weather data, and field inspection reports.",
    nextStep: "harvest",
    cameraPosition: [20, 25, -10],
    cameraLookAt: [10, 0, -10],
    subSteps: [
      { id: "planting", name: "Planting", description: "Seeds are planted at the correct depth and spacing." },
      { id: "crop-emergence", name: "Crop Emergence", description: "Seedlings emerge and begin establishing root systems." },
      { id: "irrigation", name: "Irrigation", description: "Water is delivered through drip or sprinkler systems." },
      { id: "fertilisation", name: "Fertilisation", description: "Nutrients are applied based on soil assessment and crop stage." },
      { id: "crop-monitoring", name: "Crop Monitoring", description: "Sensors and field inspections track crop health and growth." },
      { id: "field-inspection", name: "Field Inspection", description: "Workers inspect fields for pests, disease, and nutrient deficiencies." },
      { id: "crop-maturity", name: "Crop Maturity", description: "Crops reach full maturity and are ready for harvest." },
    ],
  },
  {
    id: "harvest",
    index: "05",
    name: "Harvest, Processing, Storage & Logistics",
    shortName: "Harvest",
    description:
      "When crops are ready, VAN deploys combines and harvest crews, moves produce to processing and storage, and manages the logistics chain. Grain silos, warehouses, and cold storage facilities ensure quality is maintained from field to market.",
    whatVANSupplies:
      "Harvesting equipment, processing facilities, grain silos, warehouses, cold storage, and transport vehicles.",
    whatFarmerReceives:
      "Efficient harvest operations, quality-controlled processing, secure storage, and reliable transport to market.",
    whatIsRecorded:
      "Harvest quantities, quality grades, processing status, storage levels, shipment tracking, and delivery confirmations.",
    nextStep: "finance",
    cameraPosition: [-20, 25, -20],
    cameraLookAt: [-25, 0, -20],
    subSteps: [
      { id: "harvest-initiation", name: "Harvest Initiation", description: "Combine harvesters are deployed to the mature field." },
      { id: "cutting", name: "Cutting", description: "Crops are cut and separated from stalks." },
      { id: "collection", name: "Collection", description: "Harvested produce is collected into transport vehicles." },
      { id: "loading", name: "Loading", description: "Produce is loaded for transport to processing." },
      { id: "weighing", name: "Weighing", description: "Harvest quantity is weighed and recorded." },
      { id: "sorting-grading", name: "Sorting & Grading", description: "Produce is sorted by quality and grade." },
      { id: "processing", name: "Processing", description: "Produce enters the processing facility for cleaning and packaging." },
      { id: "storage", name: "Storage", description: "Processed goods enter silos and warehouses." },
    ],
  },
  {
    id: "finance",
    index: "06",
    name: "Finance, Commerce & Market",
    shortName: "Finance",
    description:
      "The final stage connects the physical harvest to commercial outcomes. VAN records all costs and revenues, tracks shipments to buyers, manages payments, and provides a clear picture of crop-cycle profitability — informing planning for the next season.",
    whatVANSupplies:
      "Financial tracking, market connections, payment processing, and profitability analysis across the entire crop cycle.",
    whatFarmerReceives:
      "Clear financial records, timely payments, market access, and data-driven insights for the next season's planning.",
    whatIsRecorded:
      "All expenses, revenues, outstanding receivables, and estimated crop-cycle profitability — feeding back into land assessment for the next cycle.",
    nextStep: null,
    cameraPosition: [0, 30, -35],
    cameraLookAt: [0, 0, -30],
    subSteps: [
      { id: "shipment-preparation", name: "Shipment Preparation", description: "Stored produce is prepared for dispatch to buyers." },
      { id: "vehicle-dispatch", name: "Vehicle Dispatch", description: "A transport vehicle is assigned and loaded." },
      { id: "transportation", name: "Transportation", description: "The truck travels from storage to the market destination." },
      { id: "delivery", name: "Delivery", description: "Produce arrives at the buyer's facility." },
      { id: "buyer-acceptance", name: "Buyer Acceptance", description: "The buyer inspects and accepts the delivery." },
      { id: "financial-settlement", name: "Financial Settlement", description: "Payment is processed and the farmer's account is updated." },
    ],
  },
];

// ─── World Locations (Explore Mode) ──────────────────────────────

export const worldLocations: WorldLocation[] = [
  {
    id: "loc-assessment",
    name: "Land Assessment Zone",
    category: "soil-assessment",
    description:
      "The starting point of every agricultural cycle. Fields are mapped, soil samples are collected, and laboratory analysis determines nutrient levels, pH, texture, and crop suitability.",
    whatVANDoes:
      "VAN conducts soil sampling, laboratory testing, field mapping, and provides agronomic interpretation through the Field Passport system.",
    connections: ["loc-inputs", "loc-operations"],
    cameraPosition: [15, 15, 15],
    cameraLookAt: [0, 0, 0],
    objects: ["eq-weather-01"],
  },
  {
    id: "loc-inputs",
    name: "Agricultural Supply Centre",
    category: "inputs",
    description:
      "VAN's input supply facility stores and distributes seeds, fertilisers, crop protection products, and irrigation components. Inventory is managed centrally and delivered to fields as needed.",
    whatVANDoes:
      "VAN procures, stocks, and distributes agricultural inputs, ensuring quality and availability for all connected operations.",
    connections: ["loc-assessment", "loc-machinery", "loc-operations"],
    cameraPosition: [-25, 15, 20],
    cameraLookAt: [-35, 0, 0],
    objects: ["warehouse-seed", "eq-005"],
  },
  {
    id: "loc-machinery",
    name: "Machinery Yard",
    category: "machinery",
    description:
      "The operational heart of VAN's equipment fleet. Tractors, combines, sprayers, and implements are stored, maintained, and deployed from this yard.",
    whatVANDoes:
      "VAN owns, leases, and operates machinery, deploying equipment where needed with trained operators and scheduled maintenance.",
    connections: ["loc-inputs", "loc-workshop", "loc-operations"],
    cameraPosition: [5, 15, 25],
    cameraLookAt: [0, 0, 12],
    objects: ["eq-001", "eq-003", "eq-004"],
  },
  {
    id: "loc-workshop",
    name: "Equipment Maintenance Workshop",
    category: "workshop",
    description:
      "VAN's maintenance facility ensures all machinery remains operational. Scheduled servicing, repairs, and inspections keep the fleet reliable.",
    whatVANDoes:
      "VAN operates a maintenance workshop with trained technicians, ensuring equipment availability and reducing downtime.",
    connections: ["loc-machinery"],
    cameraPosition: [10, 12, 22],
    cameraLookAt: [5, 0, 14],
    objects: ["workshop-01"],
  },
  {
    id: "loc-operations",
    name: "Agricultural Fields",
    category: "operations",
    description:
      "The growing area where crops are cultivated through the full lifecycle. Fields are monitored continuously with sensors, weather data, and field inspections.",
    whatVANDoes:
      "VAN coordinates all field operations including planting, irrigation, fertilisation, crop protection, and monitoring.",
    connections: ["loc-assessment", "loc-machinery", "loc-harvest"],
    cameraPosition: [20, 20, 0],
    cameraLookAt: [10, 0, -10],
    objects: [],
  },
  {
    id: "loc-irrigation",
    name: "Irrigation Infrastructure",
    category: "irrigation",
    description:
      "Water management systems including pumps, channels, and drip irrigation networks ensure crops receive adequate water throughout the growing season.",
    whatVANDoes:
      "VAN installs and manages irrigation infrastructure, monitoring water usage and scheduling irrigation based on crop needs and weather data.",
    connections: ["loc-operations"],
    cameraPosition: [22, 12, -8],
    cameraLookAt: [14, 0, -14],
    objects: [],
  },
  {
    id: "loc-harvest",
    name: "Harvesting Zone",
    category: "harvest",
    description:
      "When crops reach maturity, combines and harvest crews are deployed. Harvested produce is collected, weighed, and moved to processing and storage.",
    whatVANDoes:
      "VAN deploys harvesting equipment and crews, manages the harvest operation, and coordinates the movement of produce to processing.",
    connections: ["loc-operations", "loc-processing", "loc-storage"],
    cameraPosition: [-15, 20, -5],
    cameraLookAt: [-22, 0, -16],
    objects: ["eq-002"],
  },
  {
    id: "loc-processing",
    name: "Processing Facility",
    category: "processing",
    description:
      "Harvested produce enters the processing facility for sorting, grading, cleaning, and packaging. Quality control ensures produce meets market standards.",
    whatVANDoes:
      "VAN operates processing facilities that sort, grade, and package agricultural produce for market delivery.",
    connections: ["loc-harvest", "loc-storage"],
    cameraPosition: [-25, 15, -15],
    cameraLookAt: [-30, 0, -22],
    objects: ["facility-01"],
  },
  {
    id: "loc-storage",
    name: "Grain Storage",
    category: "storage",
    description:
      "Grain silos provide secure, climate-controlled storage for harvested produce. Inventory is tracked and managed until dispatch to market.",
    whatVANDoes:
      "VAN operates grain silos and warehouses, maintaining quality and tracking inventory levels for efficient dispatch.",
    connections: ["loc-processing", "loc-cold-storage", "loc-logistics"],
    cameraPosition: [-20, 15, -18],
    cameraLookAt: [-25, 0, -26],
    objects: ["storage-001", "storage-002"],
  },
  {
    id: "loc-cold-storage",
    name: "Cold Storage Facility",
    category: "cold-storage",
    description:
      "Temperature-controlled storage for perishable agricultural products. Maintains quality and extends shelf life for fresh produce.",
    whatVANDoes:
      "VAN operates cold storage facilities for temperature-sensitive produce, ensuring quality from harvest to market.",
    connections: ["loc-storage", "loc-logistics"],
    cameraPosition: [-30, 12, -12],
    cameraLookAt: [-34, 0, -18],
    objects: ["storage-003"],
  },
  {
    id: "loc-logistics",
    name: "Logistics Hub",
    category: "logistics",
    description:
      "The transport and dispatch centre where loaded trucks depart for distribution centres and markets. Shipment tracking ensures timely delivery.",
    whatVANDoes:
      "VAN manages transport logistics, vehicle dispatch, and shipment tracking from storage to final destination.",
    connections: ["loc-storage", "loc-market"],
    cameraPosition: [-10, 15, -18],
    cameraLookAt: [-15, 0, -22],
    objects: [],
  },
  {
    id: "loc-market",
    name: "Distribution & Market Centre",
    category: "market",
    description:
      "The final destination where produce is delivered to buyers. Commercial transactions are recorded, payments processed, and financial settlement completed.",
    whatVANDoes:
      "VAN connects harvested produce with buyers, manages commercial transactions, and provides financial settlement and profitability analysis.",
    connections: ["loc-logistics"],
    cameraPosition: [5, 20, -20],
    cameraLookAt: [0, 0, -30],
    objects: ["market-01"],
  },
];
