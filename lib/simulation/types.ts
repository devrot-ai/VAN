/**
 * VAN Agricultural Simulation — Typed Data Model
 *
 * All records are fictional demonstration data, clearly labelled as such.
 * Never present these as real VAN operations.
 */

// ─── Core Entities ───────────────────────────────────────────────

export interface DemoFarmer {
  id: string;
  name: string;
  language: string;
  contact: string;
  farmIds: string[];
}

export interface DemoFarm {
  id: string;
  name: string;
  location: string;
  area: number;
  unit: "ha" | "acres";
  fieldIds: string[];
}

export type CropType = "wheat" | "maize" | "rice" | "sorghum" | "soybean";

export type CropStage =
  | "bare"
  | "prepared"
  | "planted"
  | "emerging"
  | "growing"
  | "mature"
  | "harvested";

export interface DemoField {
  id: string;
  farmId: string;
  name: string;
  area: number;
  unit: "ha" | "acres";
  crop: CropType | null;
  cropStage: CropStage;
  assessmentId: string | null;
  activityIds: string[];
}

// ─── Land Assessment ─────────────────────────────────────────────

export interface LandAssessment {
  id: string;
  fieldId: string;
  soilTestStatus: "pending" | "completed" | "not-tested";
  ph: number | null;
  organicCarbon: number | null; // percentage
  nitrogen: number | null; // kg/ha
  phosphorus: number | null; // kg/ha
  potassium: number | null; // kg/ha
  moisture: number | null; // percentage
  texture: "sandy" | "loam" | "clay" | "silty" | null;
  drainage: "good" | "moderate" | "poor" | null;
  compaction: "none" | "light" | "moderate" | "severe" | null;
  suitability: string[];
  evidenceSource: "lab" | "field-sensor" | "remote-sensing" | "none";
  testDate: string | null;
}

// ─── Inputs & Procurement ────────────────────────────────────────

export type InputCategory =
  | "seed"
  | "fertiliser"
  | "crop-protection"
  | "soil-amendment"
  | "irrigation"
  | "spare-parts";

export interface InputInventory {
  id: string;
  name: string;
  category: InputCategory;
  quantity: number;
  unit: string;
  warehouse: string;
  stockStatus: "in-stock" | "low" | "out-of-stock";
  intendedApplication: string;
  supplier: string;
}

// ─── Equipment & Machinery ───────────────────────────────────────

export type EquipmentType =
  | "tractor"
  | "combine"
  | "sprayer"
  | "seed-drill"
  | "loader"
  | "irrigation-pump"
  | "truck"
  | "plough";

export interface EquipmentAsset {
  id: string;
  name: string;
  type: EquipmentType;
  manufacturer: string;
  model: string;
  status: "operational" | "maintenance" | "idle" | "deployed";
  location: string;
  hoursUsed: number;
  maintenanceStatus: "current" | "due-soon" | "overdue";
  ownershipType: "owned" | "leased" | "contracted";
  assignedField: string | null;
  currentActivity: string | null;
}

// ─── Workers & Teams ─────────────────────────────────────────────

export interface WorkerTeam {
  id: string;
  name: string;
  role: string;
  availability: "available" | "assigned" | "unavailable";
  assignedJobs: string[];
}

// ─── Farm Operations ─────────────────────────────────────────────

export type OperationType =
  | "land-prep"
  | "soil-prep"
  | "planting"
  | "irrigation"
  | "fertilisation"
  | "crop-protection"
  | "monitoring"
  | "harvesting"
  | "transport";

export interface FarmOperation {
  id: string;
  fieldId: string;
  type: OperationType;
  scheduledDate: string;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  equipmentId: string | null;
  teamId: string | null;
  cost: number;
  currency: string;
  notes: string;
}

// ─── Harvest & Post-Harvest ──────────────────────────────────────

export interface HarvestLot {
  id: string;
  fieldId: string;
  crop: CropType;
  quantity: number;
  unit: string;
  quality: "premium" | "standard" | "below-standard";
  harvestDate: string;
  processingStatus: "raw" | "sorting" | "graded" | "processed" | "packaged";
}

export interface StorageRecord {
  id: string;
  location: string;
  harvestLotId: string;
  quantity: number;
  unit: string;
  storageType: "silo" | "warehouse" | "cold-storage";
  storageDate: string;
}

// ─── Logistics & Transport ───────────────────────────────────────

export interface Shipment {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  quantity: number;
  unit: string;
  dispatchStatus: "pending" | "dispatched" | "in-transit" | "delivered";
  deliveryStatus: "pending" | "received" | "rejected";
  dispatchDate: string;
  deliveryDate: string | null;
}

// ─── Finance ─────────────────────────────────────────────────────

export type FinanceCategory =
  | "input-cost"
  | "machinery-cost"
  | "labour-cost"
  | "harvest-cost"
  | "storage-cost"
  | "transport-cost"
  | "sales-revenue"
  | "other";

export interface FinancialTransaction {
  id: string;
  category: FinanceCategory;
  entityId: string;
  description: string;
  amount: number;
  currency: string;
  status: "recorded" | "pending" | "settled";
  date: string;
}

// ─── Journey Stage ───────────────────────────────────────────────

export type JourneyStage =
  | "land-assessment"
  | "inputs"
  | "machinery"
  | "operations"
  | "harvest"
  | "finance";

export type JourneyMode = "explore" | "journey";

export type WorldCategory =
  | "fields"
  | "soil-assessment"
  | "inputs"
  | "machinery"
  | "workshop"
  | "operations"
  | "irrigation"
  | "harvest"
  | "processing"
  | "storage"
  | "cold-storage"
  | "logistics"
  | "market"
  | "sensors";

export interface WorldLocation {
  id: string;
  name: string;
  category: WorldCategory;
  description: string;
  whatVANDoes: string;
  connections: string[];
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  objects: string[]; // IDs of objects in this location
}

export interface JourneySubStep {
  id: string;
  name: string;
  description: string;
}

export interface StageInfo {
  id: JourneyStage;
  index: string;
  name: string;
  shortName: string;
  description: string;
  whatVANSupplies: string;
  whatFarmerReceives: string;
  whatIsRecorded: string;
  nextStep: JourneyStage | null;
  cameraPosition: [number, number, number];
  cameraLookAt: [number, number, number];
  subSteps: JourneySubStep[];
}

// Maps WorldLocation categories to JourneyStage for cross-mode navigation
export const LOCATION_TO_STAGE: Record<string, JourneyStage> = {
  "soil-assessment": "land-assessment",
  "inputs": "inputs",
  "machinery": "machinery",
  "workshop": "machinery",
  "operations": "operations",
  "irrigation": "operations",
  "harvest": "harvest",
  "processing": "harvest",
  "storage": "harvest",
  "cold-storage": "harvest",
  "logistics": "harvest",
  "market": "finance",
  "sensors": "land-assessment",
  "fields": "operations",
};

// VAN business pillars for object info
export type VANPillar =
  | "land-intelligence"
  | "agricultural-inputs"
  | "machinery-infrastructure"
  | "farm-operations"
  | "harvest-processing-storage"
  | "finance-commerce-market";

export const PILLAR_NAMES: Record<VANPillar, string> = {
  "land-intelligence": "Land Intelligence & Assessment",
  "agricultural-inputs": "Agricultural Inputs & Procurement",
  "machinery-infrastructure": "Machinery & Infrastructure",
  "farm-operations": "Farm Operations & Crop Management",
  "harvest-processing-storage": "Harvest, Processing, Storage & Logistics",
  "finance-commerce-market": "Finance, Commerce & Market",
};
