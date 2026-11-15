/**
 * lib/services/fields.ts — Field business logic service.
 *
 * Handles validation, ownership checks, DB calls, and event emission for field mutations.
 * Pure functions — testable without HTTP.
 */

import {
  createField as dbCreate,
  updateField as dbUpdate,
  deleteField as dbDelete,
  listFields as dbList,
  listFieldsByFarm as dbListByFarm,
  getFieldById as dbGetById,
} from "@/lib/db/fields"
import { getFarmById } from "@/lib/db/farms"
import { listAssessmentsByField } from "@/lib/db/assessments"
import { listCropCyclesByField } from "@/lib/db/cropCycles"
import { mustPass, FIELD_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"
import { logAudit } from "@/lib/audit"

export async function createFieldService(userId: number, input: any) {
  mustPass(FIELD_SCHEMA, input)
  // If farmId is provided, verify the farm exists and belongs to the user
  if (input.farmId) {
    const farm = getFarmById(input.farmId)
    if (!farm) throw new Error("Farm not found")
    if (farm.user_id !== userId) throw new Error("Unauthorized: farm belongs to another user")
  }
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.FIELD_CREATED, { userId: String(userId), fieldId: String(row.id) })
  return row
}

export async function updateFieldService(userId: number, id: number, input: any) {
  const field = dbGetById(id)
  if (!field) throw new Error("Field not found")
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")
  
  // Handle farm reassignment
  if (input.farmId !== undefined && input.farmId !== field.farm_id) {
    const newFarmId = input.farmId ? Number(input.farmId) : null
    const oldFarmId = field.farm_id
    
    // If reassigning to a different farm, verify the destination farm
    if (newFarmId) {
      const destFarm = getFarmById(newFarmId)
      if (!destFarm) throw new Error("Destination farm not found")
      if (destFarm.user_id !== userId) throw new Error("Unauthorized: destination farm belongs to another user")
      
      // Check for active crop cycles that would block reassignment
      const activeCycles = listCropCyclesByField(id).filter((c) => c.status === "active")
      if (activeCycles.length > 0) {
        throw new Error("Cannot reassign field with active crop cycles. Complete or close the crop cycles first.")
      }
    }
    
    // Record the reassignment in audit
    if (oldFarmId !== newFarmId) {
      logAudit("FIELD_REASSIGNED", userId, {
        fieldId: String(id),
        oldFarmId: oldFarmId ?? "unassigned",
        newFarmId: newFarmId ?? "unassigned",
      })
    }
  }
  
  mustPass(FIELD_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.FIELD_UPDATED, { userId: String(userId), fieldId: String(id) })
  return true
}

export async function deleteFieldService(userId: number, id: number) {
  const field = dbGetById(id)
  if (!field) throw new Error("Field not found")
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.FIELD_DELETED, { userId: String(userId), fieldId: String(id) })
  return true
}

export function listFieldsService(userId: number) {
  return dbList(userId)
}

export function listFieldsByFarmService(userId: number, farmId: number) {
  const farm = getFarmById(farmId)
  if (!farm) throw new Error("Farm not found")
  if (farm.user_id !== userId) throw new Error("Unauthorized: farm belongs to another user")
  return dbListByFarm(farmId)
}

export function getFieldByIdService(userId: number, id: number) {
  const field = dbGetById(id)
  if (!field) return undefined
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")
  return field
}

/**
 * Get field detail with assessment history and crop cycles.
 */
export function getFieldDetailService(userId: number, fieldId: number) {
  const field = getFieldByIdService(userId, fieldId)
  if (!field) return undefined
  const assessments = listAssessmentsByField(fieldId)
  const cropCycles = listCropCyclesByField(fieldId)
  const latestApprovedAssessment = assessments.find((a) => a.status === "approved")
  return {
    ...field,
    assessments,
    assessmentCount: assessments.length,
    latestApprovedAssessment,
    cropCycles,
    cropCycleCount: cropCycles.length,
  }
}
