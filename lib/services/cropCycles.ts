/**
 * lib/services/cropCycles.ts — Crop cycle, plan, stage and input requirement services.
 *
 * Business logic layer for crop planning. Enforces:
 * - Farm/field ownership checks
 * - Assessment validation
 * - Cultivated area ≤ field area
 * - Date validation
 * - Status transitions
 * - Permission checks
 */

import {
  listCropCycles,
  listCropCyclesByField,
  listCropCyclesByFarm,
  getCropCycleById,
  getCropCycleWithDetails,
  createCropCycle as dbCreateCropCycle,
  updateCropCycle as dbUpdateCropCycle,
  deleteCropCycle as dbDeleteCropCycle,
} from "@/lib/db/cropCycles"
import { getFieldById } from "@/lib/db/fields"
import { getFarmById } from "@/lib/db/farms"
import { getAssessmentById } from "@/lib/db/assessments"
import {
  getCropPlanByCycle,
  getCropPlanById,
  createCropPlan as dbCreateCropPlan,
  updateCropPlan as dbUpdateCropPlan,
  listStagesByCycle,
  getCropStageById,
  createCropStage as dbCreateCropStage,
  updateCropStage as dbUpdateCropStage,
  deleteCropStage as dbDeleteCropStage,
  listInputRequirementsByCycle,
  listInputRequirementsByUser,
  getInputRequirementById,
  createInputRequirement as dbCreateInputRequirement,
  updateInputRequirement as dbUpdateInputRequirement,
  deleteInputRequirement as dbDeleteInputRequirement,
} from "@/lib/db/cropCycles"
import { mustPass, CROP_CYCLE_SCHEMA, CROP_PLAN_SCHEMA, CROP_CYCLE_STAGE_SCHEMA, INPUT_REQUIREMENT_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

// ==================== CROP CYCLE SERVICES ====================

export async function createCropCycleService(userId: number, input: any) {
  mustPass(CROP_CYCLE_SCHEMA, input)

  const field = getFieldById(input.fieldId)
  if (!field) throw new Error("Field not found")
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")

  // Validate assessment if provided
  if (input.assessmentId) {
    const assessment = getAssessmentById(input.assessmentId)
    if (!assessment) throw new Error("Assessment not found")
    if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
    if (assessment.field_id !== input.fieldId) throw new Error("Assessment does not belong to this field")
  }

  // Validate cultivated area does not exceed field area
  if (input.cultivatedAreaHa && input.cultivatedAreaHa > field.area_ha) {
    throw new Error(`Cultivated area (${input.cultivatedAreaHa} ha) exceeds field area (${field.area_ha} ha)`)
  }

  // Validate dates
  if (input.plannedPlantingDate && input.plannedHarvestDate) {
    if (input.plannedHarvestDate < input.plannedPlantingDate) {
      throw new Error("Planned harvest date cannot be before planned planting date")
    }
  }

  const cycle = dbCreateCropCycle({
    userId,
    fieldId: input.fieldId,
    assessmentId: input.assessmentId || null,
    cropType: input.cropType,
    variety: input.variety || null,
    season: input.season || null,
    cultivatedAreaHa: input.cultivatedAreaHa || null,
    plannedStartDate: input.plannedStartDate || null,
    plannedPlantingDate: input.plannedPlantingDate || null,
    plannedHarvestDate: input.plannedHarvestDate || null,
    notes: input.notes || null,
  })

  await events.emit(EVENT_TYPES.CROP_CYCLE_CREATED, {
    userId: String(userId),
    cropCycleId: String(cycle.id),
  })

  return cycle
}

export async function updateCropCycleService(userId: number, id: number, input: any) {
  const cycle = getCropCycleById(id)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")

  // Protected statuses cannot be modified
  if (cycle.status === "closed" || cycle.status === "harvested") {
    throw new Error(`Cannot modify crop cycle with status "${cycle.status}". Reopen the cycle first.`)
  }

  // Validate assessment if changing
  if (input.assessmentId !== undefined && input.assessmentId) {
    const assessment = getAssessmentById(input.assessmentId)
    if (!assessment) throw new Error("Assessment not found")
    if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
    if (assessment.field_id !== cycle.field_id) throw new Error("Assessment does not belong to this field")
  }

  // Validate cultivated area
  if (input.cultivatedAreaHa) {
    const field = getFieldById(cycle.field_id)
    if (field && input.cultivatedAreaHa > field.area_ha) {
      throw new Error(`Cultivated area (${input.cultivatedAreaHa} ha) exceeds field area (${field.area_ha} ha)`)
    }
  }

  // Validate dates
  const newPlantingDate = input.plannedPlantingDate || cycle.planned_planting_date
  const newHarvestDate = input.plannedHarvestDate || cycle.planned_harvest_date
  if (newPlantingDate && newHarvestDate && newHarvestDate < newPlantingDate) {
    throw new Error("Planned harvest date cannot be before planned planting date")
  }

  // Validate individual fields being updated (skip full schema since fieldId/cropType are create-only required)
  if (input.cropType !== undefined) {
    const trimmed = String(input.cropType).trim()
    if (trimmed.length === 0 || trimmed.length > 100) throw new Error("cropType must be 1-100 characters")
  }
  if (input.cultivatedAreaHa !== undefined && (input.cultivatedAreaHa < 0.01 || input.cultivatedAreaHa > 100000)) {
    throw new Error("cultivatedAreaHa must be between 0.01 and 100000")
  }
  if (input.status !== undefined && !["planned", "active", "harvesting", "harvested", "closed", "cancelled"].includes(input.status)) {
    throw new Error("Invalid status")
  }
  if (input.stage !== undefined && !["planned", "land_preparation", "sowing", "vegetative", "flowering", "maturing", "harvesting", "harvested"].includes(input.stage)) {
    throw new Error("Invalid stage")
  }
  dbUpdateCropCycle(id, input, userId)
  await events.emit(EVENT_TYPES.CROP_CYCLE_UPDATED, {
    userId: String(userId),
    cropCycleId: String(id),
  })
  return getCropCycleById(id)
}

export async function deleteCropCycleService(userId: number, id: number) {
  const cycle = getCropCycleById(id)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")

  // Cannot delete active or harvested cycles
  if (cycle.status === "active" || cycle.status === "harvesting" || cycle.status === "harvested") {
    throw new Error(`Cannot delete crop cycle with status "${cycle.status}". Close the cycle first.`)
  }

  dbDeleteCropCycle(id, userId)
  await events.emit(EVENT_TYPES.CROP_CYCLE_DELETED, {
    userId: String(userId),
    cropCycleId: String(id),
  })
  return true
}

export function listCropCyclesService(userId: number) {
  return listCropCycles(userId)
}

export function listCropCyclesByFarmService(userId: number, farmId: number) {
  const farm = getFarmById(farmId)
  if (!farm) throw new Error("Farm not found")
  if (farm.user_id !== userId) throw new Error("Unauthorized: farm belongs to another user")
  return listCropCyclesByFarm(farmId)
}

export function listCropCyclesByFieldService(userId: number, fieldId: number) {
  const field = getFieldById(fieldId)
  if (!field) throw new Error("Field not found")
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")
  return listCropCyclesByField(fieldId)
}

export function getCropCycleByIdService(userId: number, id: number) {
  const cycle = getCropCycleWithDetails(id)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")
  return cycle
}

export async function changeCropCycleStageService(userId: number, id: number, stage: string) {
  return updateCropCycleService(userId, id, { stage })
}

export async function changeCropCycleStatusService(userId: number, id: number, status: string) {
  const cycle = getCropCycleById(id)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")

  // Validate status transitions
  const allowedTransitions: Record<string, string[]> = {
    planned: ["active", "cancelled"],
    active: ["harvesting", "cancelled"],
    harvesting: ["harvested", "active"],
    harvested: ["closed"],
  }
  const allowed = allowedTransitions[cycle.status]
  if (!allowed || !allowed.includes(status)) {
    throw new Error(`Invalid status transition from "${cycle.status}" to "${status}"`)
  }

  // Direct DB update for status-only change, bypassing the modification check
  dbUpdateCropCycle(id, { status }, userId)
  await events.emit(EVENT_TYPES.CROP_CYCLE_UPDATED, {
    userId: String(userId),
    cropCycleId: String(id),
    action: `status_changed_to_${status}`,
  })
  return getCropCycleById(id)
}

// ==================== CROP PLAN SERVICES ====================

export async function createCropPlanService(userId: number, input: any) {
  mustPass(CROP_PLAN_SCHEMA, input)

  const cycle = getCropCycleById(input.cropCycleId)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")

  const plan = dbCreateCropPlan({
    cropCycleId: input.cropCycleId,
    plantingMethod: input.plantingMethod || null,
    irrigationApproach: input.irrigationApproach || null,
    fieldConditions: input.fieldConditions || null,
    planningNotes: input.planningNotes || null,
    createdBy: userId,
  })

  await events.emit(EVENT_TYPES.CROP_PLAN_CREATED, {
    userId: String(userId),
    cropPlanId: String(plan.id),
    cropCycleId: String(input.cropCycleId),
  })

  return plan
}

export async function updateCropPlanService(userId: number, id: number, input: any) {
  const plan = getCropPlanById(id)
  if (!plan) throw new Error("Crop plan not found")

  const cycle = getCropCycleById(plan.crop_cycle_id)
  if (!cycle || cycle.user_id !== userId) throw new Error("Unauthorized: crop plan belongs to another user")

  mustPass(CROP_PLAN_SCHEMA, input)
  dbUpdateCropPlan(id, input)
  await events.emit(EVENT_TYPES.CROP_PLAN_UPDATED, {
    userId: String(userId),
    cropPlanId: String(id),
    action: input.status ? `status_changed_to_${input.status}` : "updated",
  })
  return getCropPlanById(id)
}

export function getCropPlanByCycleService(userId: number, cropCycleId: number) {
  const cycle = getCropCycleById(cropCycleId)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")
  return getCropPlanByCycle(cropCycleId)
}

// ==================== CROP STAGE SERVICES ====================

export async function createCropStageService(userId: number, input: any) {
  mustPass(CROP_CYCLE_STAGE_SCHEMA, input)

  const cycle = getCropCycleById(input.cropCycleId)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")

  const stage = dbCreateCropStage({
    cropCycleId: input.cropCycleId,
    stageName: input.stageName,
    sequence: input.sequence,
    plannedStartDate: input.plannedStartDate || null,
    plannedEndDate: input.plannedEndDate || null,
    description: input.description || null,
    responsiblePerson: input.responsiblePerson || null,
    notes: input.notes || null,
  })

  await events.emit(EVENT_TYPES.CROP_STAGE_CREATED, {
    userId: String(userId),
    stageId: String(stage.id),
    cropCycleId: String(input.cropCycleId),
  })

  return stage
}

export async function updateCropStageService(userId: number, id: number, input: any) {
  const stage = getCropStageById(id)
  if (!stage) throw new Error("Crop stage not found")

  const cycle = getCropCycleById(stage.crop_cycle_id)
  if (!cycle || cycle.user_id !== userId) throw new Error("Unauthorized: crop stage belongs to another user")

  mustPass(CROP_CYCLE_STAGE_SCHEMA, input)
  dbUpdateCropStage(id, input)
  await events.emit(EVENT_TYPES.CROP_STAGE_UPDATED, {
    userId: String(userId),
    stageId: String(id),
    action: input.status ? `status_changed_to_${input.status}` : "updated",
  })
  return getCropStageById(id)
}

export function listStagesByCycleService(userId: number, cropCycleId: number) {
  const cycle = getCropCycleById(cropCycleId)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")
  return listStagesByCycle(cropCycleId)
}

export async function deleteCropStageService(userId: number, id: number) {
  const stage = getCropStageById(id)
  if (!stage) throw new Error("Crop stage not found")

  const cycle = getCropCycleById(stage.crop_cycle_id)
  if (!cycle || cycle.user_id !== userId) throw new Error("Unauthorized: crop stage belongs to another user")

  dbDeleteCropStage(id)
  return true
}

// ==================== INPUT REQUIREMENT SERVICES ====================

export async function createInputRequirementService(userId: number, input: any) {
  mustPass(INPUT_REQUIREMENT_SCHEMA, input)

  const cycle = getCropCycleById(input.cropCycleId)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")

  // Calculate quantity from rate per ha if cultivated area available
  let plannedQuantity = input.plannedQuantity
  if (input.ratePerHa && cycle.cultivated_area_ha && !input.plannedQuantity) {
    plannedQuantity = input.ratePerHa * cycle.cultivated_area_ha
  }

  // Require either plannedQuantity or ratePerHa with cultivated area
  if (!plannedQuantity || plannedQuantity < 0.001) {
    throw new Error("plannedQuantity is required, or provide ratePerHa with a crop cycle that has cultivated area")
  }

  // Calculate estimated total cost using the resolved plannedQuantity
  let estimatedTotalCost = input.estimatedTotalCost
  if (input.estimatedUnitPrice && plannedQuantity) {
    estimatedTotalCost = input.estimatedUnitPrice * plannedQuantity
  }

  const requirement = dbCreateInputRequirement({
    userId,
    farmId: null,
    fieldId: cycle.field_id,
    cropCycleId: input.cropCycleId,
    cropPlanId: input.cropPlanId || null,
    inputCatalogueId: input.inputCatalogueId || null,
    inputCategory: input.inputCategory,
    productName: input.productName || null,
    plannedQuantity: plannedQuantity,
    unit: input.unit,
    ratePerHa: input.ratePerHa || null,
    plannedApplicationDate: input.plannedApplicationDate || null,
    intendedPurpose: input.intendedPurpose || null,
    estimatedUnitPrice: input.estimatedUnitPrice || null,
    estimatedTotalCost,
    createdBy: userId,
    notes: input.notes || null,
  })

  await events.emit(EVENT_TYPES.INPUT_REQUIREMENT_CREATED, {
    userId: String(userId),
    requirementId: String(requirement.id),
    cropCycleId: String(input.cropCycleId),
  })

  return requirement
}

export async function updateInputRequirementService(userId: number, id: number, input: any) {
  const req = getInputRequirementById(id)
  if (!req) throw new Error("Input requirement not found")
  if (req.user_id !== userId) throw new Error("Unauthorized: input requirement belongs to another user")

  // Cannot modify fulfilled requirements
  if (req.status === "fulfilled") {
    throw new Error("Cannot modify fulfilled input requirement")
  }

  mustPass(INPUT_REQUIREMENT_SCHEMA, input)

  // Recalculate estimated total cost
  let estimatedTotalCost = input.estimatedTotalCost
  const unitPrice = input.estimatedUnitPrice ?? req.estimated_unit_price
  const quantity = input.plannedQuantity ?? req.planned_quantity
  if (unitPrice && quantity) {
    estimatedTotalCost = unitPrice * quantity
  }

  dbUpdateInputRequirement(id, { ...input, estimatedTotalCost })
  await events.emit(EVENT_TYPES.INPUT_REQUIREMENT_UPDATED, {
    userId: String(userId),
    requirementId: String(id),
    action: input.status ? `status_changed_to_${input.status}` : "updated",
  })
  return getInputRequirementById(id)
}

export async function deleteInputRequirementService(userId: number, id: number) {
  const req = getInputRequirementById(id)
  if (!req) throw new Error("Input requirement not found")
  if (req.user_id !== userId) throw new Error("Unauthorized: input requirement belongs to another user")

  if (req.status === "fulfilled" || req.status === "sent_for_procurement") {
    throw new Error(`Cannot delete input requirement with status "${req.status}"`)
  }

  dbDeleteInputRequirement(id)
  return true
}

export function listInputRequirementsByCycleService(userId: number, cropCycleId: number) {
  const cycle = getCropCycleById(cropCycleId)
  if (!cycle) throw new Error("Crop cycle not found")
  if (cycle.user_id !== userId) throw new Error("Unauthorized: crop cycle belongs to another user")
  return listInputRequirementsByCycle(cropCycleId)
}

export function listInputRequirementsService(userId: number) {
  return listInputRequirementsByUser(userId)
}
