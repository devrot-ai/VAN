/**
 * lib/validate.ts — Schema-based validation for all entities.
 *
 * Inspired by OpenHands SDK typed tool system.
 * Each entity has a validation schema. Routes declare their schema instead
 * of writing inline validation. This concentrates validation logic in one place.
 */

/* ---------- Field Types ---------- */

export type StringField = {
  type: "string"
  maxLength?: number
  minLength?: number
  pattern?: RegExp
  patternMessage?: string
}

export type NumberField = {
  type: "number"
  min?: number
  max?: number
  integer?: boolean
}

export type EnumField<T extends string = string> = {
  type: "enum"
  values: readonly T[]
}

export type OptionalField<F> = {
  field: F
  optional: true
}

export type SchemaField = StringField | NumberField | EnumField | OptionalField<StringField | NumberField | EnumField>

export interface ValidationSchema {
  [fieldName: string]: SchemaField
}

export interface ValidationError {
  field: string
  message: string
}

/* ---------- Validator ---------- */

export function validate(schema: ValidationSchema, data: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = []

  for (const [field, def] of Object.entries(schema)) {
    const schemaDef = isOptional(def) ? def.field : def
    const value = data[field]

    // Skip optional fields that are not provided
    if (isOptional(def) && (value === undefined || value === null || value === "")) {
      continue
    }

    const coercedValue = isOptional(def) ? value : value

    switch (schemaDef.type) {
      case "string":
        validateString(errors, field, String(coercedValue), schemaDef)
        break
      case "number":
        validateNumber(errors, field, coercedValue, schemaDef)
        break
      case "enum":
        validateEnum(errors, field, coercedValue, schemaDef)
        break
    }
  }

  return errors
}

function isOptional(def: SchemaField): def is OptionalField<any> {
  return (def as any).optional === true
}

function validateString(errors: ValidationError[], field: string, value: string, def: StringField) {
  if (typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string` })
    return
  }
  if (def.minLength && value.length < def.minLength) {
    errors.push({ field, message: `${field} must be at least ${def.minLength} characters` })
  }
  if (def.maxLength && value.length > def.maxLength) {
    errors.push({ field, message: `${field} must be at most ${def.maxLength} characters` })
  }
  if (def.pattern && !def.pattern.test(value)) {
    errors.push({ field, message: def.patternMessage ?? `${field} has invalid format` })
  }
}

function validateNumber(errors: ValidationError[], field: string, value: any, def: NumberField) {
  const num = Number(value)
  if (isNaN(num)) {
    errors.push({ field, message: `${field} must be a number` })
    return
  }
  if (def.integer && !Number.isInteger(num)) {
    errors.push({ field, message: `${field} must be an integer` })
    return
  }
  if (def.min !== undefined && num < def.min) {
    errors.push({ field, message: `${field} must be at least ${def.min}` })
  }
  if (def.max !== undefined && num > def.max) {
    errors.push({ field, message: `${field} must be at most ${def.max}` })
  }
}

function validateEnum(errors: ValidationError[], field: string, value: any, def: EnumField) {
  if (!def.values.includes(value)) {
    errors.push({ field, message: `${field} must be one of: ${def.values.join(", ")}` })
  }
}

/* ---------- Entity Schemas ---------- */

// Schemas use camelCase to match API route field names.
// The DB layer (lib/db/) handles camelCase → snake_case mapping in SQL.

export const FIELD_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  areaHa: { type: "number", min: 0.01, max: 100000 },
  crop: { field: { type: "string", maxLength: 200 }, optional: true },
  status: { type: "enum", values: ["planned", "planted", "growing", "harvesting", "harvested", "fallow"] as const },
  notes: { field: { type: "string", maxLength: 500 }, optional: true },
}

export const ACTIVITY_SCHEMA: ValidationSchema = {
  title: { type: "string", minLength: 1, maxLength: 300 },
  category: { field: { type: "string", maxLength: 100 }, optional: true },
  dueDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "dueDate must be YYYY-MM-DD" }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
  done: { field: { type: "string", maxLength: 5 }, optional: true },
}

export const DEVICE_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  kind: { type: "string", minLength: 1, maxLength: 100 },
  location: { field: { type: "string", maxLength: 300 }, optional: true },
  status: { type: "enum", values: ["online", "offline", "maintenance"] as const },
}

export const EQUIPMENT_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  category: { type: "string", minLength: 1, maxLength: 100 },
  dailyRate: { field: { type: "number", min: 0 }, optional: true },
  location: { field: { type: "string", maxLength: 300 }, optional: true },
  status: { type: "enum", values: ["available", "booked", "maintenance", "retired"] as const },
}

export const TRANSACTION_SCHEMA: ValidationSchema = {
  description: { type: "string", minLength: 1, maxLength: 300 },
  amount: { type: "number", min: 0.01 },
  type: { type: "enum", values: ["income", "expense"] as const },
  date: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "date must be YYYY-MM-DD" },
  category: { field: { type: "string", maxLength: 100 }, optional: true },
}

export const MAINTENANCE_SCHEMA: ValidationSchema = {
  task: { type: "string", minLength: 1, maxLength: 300 },
  equipmentId: { type: "number", min: 1, integer: true },
  dueDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "dueDate must be YYYY-MM-DD" }, optional: true },
  status: { type: "enum", values: ["scheduled", "in_progress", "completed"] as const },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
}

export const HARVEST_SCHEMA: ValidationSchema = {
  crop: { type: "string", minLength: 1, maxLength: 200 },
  quantityTonnes: { type: "number", min: 0.01 },
  fieldId: { type: "number", min: 1, integer: true },
  date: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "date must be YYYY-MM-DD" },
  quality: { field: { type: "string", maxLength: 100 }, optional: true },
  status: { type: "enum", values: ["planned", "ready", "harvested", "sold"] as const },
}

export const MEMBER_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  farm: { field: { type: "string", maxLength: 120 }, optional: true },
  status: { type: "enum", values: ["active", "pending", "suspended"] as const },
  fieldsCount: { field: { type: "number", min: 0, integer: true }, optional: true },
}

export const PURCHASE_SCHEMA: ValidationSchema = {
  lot: { type: "string", minLength: 1, maxLength: 300 },
  buyer: { field: { type: "string", maxLength: 200 }, optional: true },
  quantityTonnes: { field: { type: "number", min: 0 }, optional: true },
  amount: { field: { type: "number", min: 0 }, optional: true },
  status: { type: "enum", values: ["enquiry", "confirmed", "scheduled", "delivered", "cancelled"] as const },
}

// --- Agricultural lifecycle schemas ---

export const FARM_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  address: { field: { type: "string", maxLength: 500 }, optional: true },
  totalAreaHa: { type: "number", min: 0.01, max: 1000000 },
  status: { type: "enum", values: ["active", "inactive", "archived"] as const },
}

export const CROP_CYCLE_SCHEMA: ValidationSchema = {
  fieldId: { type: "number", min: 1, integer: true },
  assessmentId: { field: { type: "number", min: 1, integer: true }, optional: true },
  cropType: { type: "string", minLength: 1, maxLength: 100 },
  variety: { field: { type: "string", maxLength: 100 }, optional: true },
  season: { field: { type: "string", maxLength: 50 }, optional: true },
  cultivatedAreaHa: { field: { type: "number", min: 0.01, max: 100000 }, optional: true },
  plannedStartDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedStartDate must be YYYY-MM-DD" }, optional: true },
  plannedPlantingDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedPlantingDate must be YYYY-MM-DD" }, optional: true },
  plannedHarvestDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedHarvestDate must be YYYY-MM-DD" }, optional: true },
  stage: { field: { type: "enum", values: ["planned", "land_preparation", "sowing", "vegetative", "flowering", "maturing", "harvesting", "harvested"] as const }, optional: true },
  status: { field: { type: "enum", values: ["planned", "active", "harvesting", "harvested", "closed", "cancelled"] as const }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
}

export const CROP_PLAN_SCHEMA: ValidationSchema = {
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  plantingMethod: { field: { type: "string", maxLength: 200 }, optional: true },
  irrigationApproach: { field: { type: "string", maxLength: 200 }, optional: true },
  fieldConditions: { field: { type: "string", maxLength: 2000 }, optional: true },
  planningNotes: { field: { type: "string", maxLength: 5000 }, optional: true },
  status: { field: { type: "enum", values: ["draft", "submitted", "approved", "cancelled"] as const }, optional: true },
}

export const CROP_CYCLE_STAGE_SCHEMA: ValidationSchema = {
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  stageName: { type: "string", minLength: 1, maxLength: 100 },
  sequence: { field: { type: "number", min: 0, integer: true }, optional: true },
  plannedStartDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedStartDate must be YYYY-MM-DD" }, optional: true },
  plannedEndDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedEndDate must be YYYY-MM-DD" }, optional: true },
  status: { field: { type: "enum", values: ["planned", "ready", "in_progress", "completed", "cancelled"] as const }, optional: true },
  description: { field: { type: "string", maxLength: 2000 }, optional: true },
  responsiblePerson: { field: { type: "string", maxLength: 200 }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
}

export const INPUT_REQUIREMENT_SCHEMA: ValidationSchema = {
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  inputCategory: { type: "string", minLength: 1, maxLength: 100 },
  productName: { field: { type: "string", maxLength: 200 }, optional: true },
  plannedQuantity: { field: { type: "number", min: 0.001 }, optional: true },
  unit: { type: "string", minLength: 1, maxLength: 50 },
  ratePerHa: { field: { type: "number", min: 0 }, optional: true },
  plannedApplicationDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedApplicationDate must be YYYY-MM-DD" }, optional: true },
  intendedPurpose: { field: { type: "string", maxLength: 500 }, optional: true },
  estimatedUnitPrice: { field: { type: "number", min: 0 }, optional: true },
  status: { field: { type: "enum", values: ["draft", "planned", "approved", "sent_for_procurement", "partially_fulfilled", "fulfilled", "cancelled"] as const }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
}

export const ASSESSMENT_SCHEMA: ValidationSchema = {
  fieldId: { type: "number", min: 1, integer: true },
  assessmentType: { type: "string", minLength: 1, maxLength: 100 },
  assessor: { field: { type: "string", maxLength: 200 }, optional: true },
  dataSource: { field: { type: "string", maxLength: 200 }, optional: true },
  assessmentDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "assessmentDate must be YYYY-MM-DD" }, optional: true },
  observations: { field: { type: "string", maxLength: 5000 }, optional: true },
  status: { field: { type: "enum", values: ["draft", "sample_collection", "results_pending", "under_review", "approved", "rejected", "cancelled"] as const }, optional: true },
}

export const SOIL_MEASUREMENT_SCHEMA: ValidationSchema = {
  assessmentId: { type: "number", min: 1, integer: true },
  measurementType: { type: "string", minLength: 1, maxLength: 100 },
  value: { type: "number" },
  unit: { type: "string", minLength: 1, maxLength: 50 },
  sampleId: { field: { type: "string", maxLength: 100 }, optional: true },
  method: { field: { type: "string", maxLength: 200 }, optional: true },
  source: { field: { type: "string", maxLength: 200 }, optional: true },
  referenceRangeMin: { field: { type: "number" }, optional: true },
  referenceRangeMax: { field: { type: "number" }, optional: true },
}

export const PROCUREMENT_ORDER_SCHEMA: ValidationSchema = {
  farmId: { field: { type: "number", min: 1, integer: true }, optional: true },
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  supplierId: { field: { type: "number", min: 1, integer: true }, optional: true },
  estimatedCost: { field: { type: "number", min: 0 }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
  status: { type: "enum", values: ["draft", "submitted", "approved", "ordered", "partially_received", "received", "rejected", "cancelled"] as const },
}

export const WORK_ORDER_SCHEMA: ValidationSchema = {
  farmId: { field: { type: "number", min: 1, integer: true }, optional: true },
  fieldId: { field: { type: "number", min: 1, integer: true }, optional: true },
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  equipmentId: { field: { type: "number", min: 1, integer: true }, optional: true },
  operatorId: { field: { type: "number", min: 1, integer: true }, optional: true },
  activityType: { type: "string", minLength: 1, maxLength: 100 },
  description: { field: { type: "string", maxLength: 2000 }, optional: true },
  plannedStartDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedStartDate must be YYYY-MM-DD" }, optional: true },
  plannedEndDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "plannedEndDate must be YYYY-MM-DD" }, optional: true },
  status: { type: "enum", values: ["draft", "scheduled", "assigned", "in_progress", "completed", "delayed", "cancelled", "failed"] as const },
}

export const HARVEST_LOT_SCHEMA: ValidationSchema = {
  cropCycleId: { type: "number", min: 1, integer: true },
  fieldId: { type: "number", min: 1, integer: true },
  harvestDate: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "harvestDate must be YYYY-MM-DD" },
  quantity: { type: "number", min: 0.001 },
  unit: { type: "enum", values: ["tonnes", "kg", "litres", "quintals"] as const },
  qualityGrade: { field: { type: "string", maxLength: 50 }, optional: true },
  moistureContent: { field: { type: "number", min: 0, max: 100 }, optional: true },
  location: { field: { type: "string", maxLength: 300 }, optional: true },
  status: { type: "enum", values: ["created", "weighed", "graded", "available", "reserved", "dispatched", "sold"] as const },
}

// --- Sprint 04: Input supply chain schemas ---

export const INPUT_CATALOGUE_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  category: { type: "string", minLength: 1, maxLength: 100 },
  manufacturer: { field: { type: "string", maxLength: 200 }, optional: true },
  brand: { field: { type: "string", maxLength: 100 }, optional: true },
  sku: { field: { type: "string", maxLength: 100 }, optional: true },
  description: { field: { type: "string", maxLength: 2000 }, optional: true },
  unit: { type: "string", minLength: 1, maxLength: 50 },
  packageSize: { field: { type: "number", min: 0.001 }, optional: true },
  unitPrice: { field: { type: "number", min: 0 }, optional: true },
  storageConditions: { field: { type: "string", maxLength: 500 }, optional: true },
  status: { field: { type: "enum", values: ["active", "inactive", "archived"] as const }, optional: true },
}

export const SUPPLIER_SCHEMA: ValidationSchema = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  contactName: { field: { type: "string", maxLength: 200 }, optional: true },
  email: { field: { type: "string", maxLength: 200, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: "email must be a valid email" }, optional: true },
  phone: { field: { type: "string", maxLength: 20 }, optional: true },
  address: { field: { type: "string", maxLength: 500 }, optional: true },
  supplierType: { field: { type: "string", maxLength: 100 }, optional: true },
  country: { field: { type: "string", maxLength: 100 }, optional: true },
  region: { field: { type: "string", maxLength: 100 }, optional: true },
  terms: { field: { type: "string", maxLength: 2000 }, optional: true },
  status: { field: { type: "enum", values: ["active", "inactive", "suspended"] as const }, optional: true },
}

export const SUPPLIER_PRODUCT_SCHEMA: ValidationSchema = {
  supplierId: { type: "number", min: 1, integer: true },
  inputId: { type: "number", min: 1, integer: true },
  supplierSku: { field: { type: "string", maxLength: 100 }, optional: true },
  packageSize: { field: { type: "number", min: 0.001 }, optional: true },
  offeredUnit: { type: "string", minLength: 1, maxLength: 50 },
  unitPrice: { field: { type: "number", min: 0 }, optional: true },
  currency: { field: { type: "string", maxLength: 10 }, optional: true },
  minOrderQuantity: { field: { type: "number", min: 0 }, optional: true },
  availableQuantity: { field: { type: "number", min: 0 }, optional: true },
  leadTimeDays: { field: { type: "number", min: 0, integer: true }, optional: true },
  offerValidUntil: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "offerValidUntil must be YYYY-MM-DD" }, optional: true },
  status: { field: { type: "enum", values: ["active", "inactive", "expired"] as const }, optional: true },
}

export const INPUT_SUPPLY_REQUEST_SCHEMA: ValidationSchema = {
  farmId: { type: "number", min: 1, integer: true },
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  deliveryLocation: { field: { type: "string", maxLength: 500 }, optional: true },
  requestedDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "requestedDate must be YYYY-MM-DD" }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
  status: { field: { type: "enum", values: ["draft", "submitted", "under_review", "accepted", "rejected", "partially_fulfilled", "fulfilled", "cancelled"] as const }, optional: true },
}

export const INPUT_SUPPLY_REQUEST_ITEM_SCHEMA: ValidationSchema = {
  requestId: { type: "number", min: 1, integer: true },
  inputRequirementId: { field: { type: "number", min: 1, integer: true }, optional: true },
  inputId: { type: "number", min: 1, integer: true },
  quantity: { type: "number", min: 0.001 },
  unit: { type: "string", minLength: 1, maxLength: 50 },
  requestedDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "requestedDate must be YYYY-MM-DD" }, optional: true },
  notes: { field: { type: "string", maxLength: 1000 }, optional: true },
}

export const GOODS_RECEIPT_SCHEMA: ValidationSchema = {
  procurementOrderId: { type: "number", min: 1, integer: true },
  receiptDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "receiptDate must be YYYY-MM-DD" }, optional: true },
  receivingLocation: { field: { type: "string", maxLength: 300 }, optional: true },
  deliveryReference: { field: { type: "string", maxLength: 200 }, optional: true },
  batchNumber: { field: { type: "string", maxLength: 100 }, optional: true },
  expiryDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "expiryDate must be YYYY-MM-DD" }, optional: true },
  inspectionNotes: { field: { type: "string", maxLength: 2000 }, optional: true },
}

export const GOODS_RECEIPT_ITEM_SCHEMA: ValidationSchema = {
  receiptId: { type: "number", min: 1, integer: true },
  orderItemId: { type: "number", min: 1, integer: true },
  receivedQuantity: { type: "number", min: 0 },
  acceptedQuantity: { type: "number", min: 0 },
  rejectedQuantity: { field: { type: "number", min: 0 }, optional: true },
  damagedQuantity: { field: { type: "number", min: 0 }, optional: true },
  unit: { type: "string", minLength: 1, maxLength: 50 },
  notes: { field: { type: "string", maxLength: 1000 }, optional: true },
}

export const FULFILMENT_SCHEMA: ValidationSchema = {
  requestId: { type: "number", min: 1, integer: true },
  requestItemId: { field: { type: "number", min: 1, integer: true }, optional: true },
  inputId: { type: "number", min: 1, integer: true },
  inventoryId: { type: "number", min: 1, integer: true },
  farmId: { type: "number", min: 1, integer: true },
  quantity: { type: "number", min: 0.001 },
  unit: { type: "string", minLength: 1, maxLength: 50 },
  batchNumber: { field: { type: "string", maxLength: 100 }, optional: true },
  status: { field: { type: "enum", values: ["allocated", "dispatched", "delivered", "cancelled"] as const }, optional: true },
  deliveryNotes: { field: { type: "string", maxLength: 2000 }, optional: true },
}

export const PROCUREMENT_ORDER_ENHANCED_SCHEMA: ValidationSchema = {
  farmId: { field: { type: "number", min: 1, integer: true }, optional: true },
  cropCycleId: { field: { type: "number", min: 1, integer: true }, optional: true },
  supplierId: { field: { type: "number", min: 1, integer: true }, optional: true },
  expectedDeliveryDate: { field: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "expectedDeliveryDate must be YYYY-MM-DD" }, optional: true },
  currency: { field: { type: "string", maxLength: 10 }, optional: true },
  deliveryDestination: { field: { type: "string", maxLength: 500 }, optional: true },
  estimatedCost: { field: { type: "number", min: 0 }, optional: true },
  notes: { field: { type: "string", maxLength: 2000 }, optional: true },
  status: { field: { type: "enum", values: ["draft", "submitted", "approved", "sent_to_supplier", "partially_received", "received", "rejected", "cancelled", "delayed", "disputed"] as const }, optional: true },
}

/* ---------- Quick Validate Helper ---------- */

/** Validate data against a schema. Throws with field errors if invalid. */
export function mustPass(schema: ValidationSchema, data: Record<string, any>): void {
  const errors = validate(schema, data)
  if (errors.length) {
    const msg = errors.map((e) => `${e.field}: ${e.message}`).join("; ")
    throw new Error(msg)
  }
}
