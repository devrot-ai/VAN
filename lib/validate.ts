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

/* ---------- Quick Validate Helper ---------- */

/** Validate data against a schema. Throws with field errors if invalid. */
export function mustPass(schema: ValidationSchema, data: Record<string, any>): void {
  const errors = validate(schema, data)
  if (errors.length) {
    const msg = errors.map((e) => `${e.field}: ${e.message}`).join("; ")
    throw new Error(msg)
  }
}
