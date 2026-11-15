/**
 * lib/services/farms.ts — Farm business logic service.
 *
 * Handles validation, ownership checks, DB calls, and event emission for farms.
 */

import {
  createFarm as dbCreate,
  updateFarm as dbUpdate,
  deleteFarm as dbDelete,
  listFarms as dbList,
  getFarmById as dbGetById,
} from "@/lib/db/farms"
import { listFields } from "@/lib/db/fields"
import { mustPass, FARM_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createFarmService(userId: number, input: any) {
  mustPass(FARM_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.FARM_CREATED, { userId: String(userId), farmId: String(row.id) })
  return row
}

export async function updateFarmService(userId: number, id: number, input: any) {
  const farm = dbGetById(id)
  if (!farm) throw new Error("Farm not found")
  if (farm.user_id !== userId) throw new Error("Unauthorized: farm belongs to another user")
  mustPass(FARM_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.FARM_UPDATED, { userId: String(userId), farmId: String(id) })
  return true
}

export async function deleteFarmService(userId: number, id: number) {
  const farm = dbGetById(id)
  if (!farm) throw new Error("Farm not found")
  if (farm.user_id !== userId) throw new Error("Unauthorized: farm belongs to another user")
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.FARM_DELETED, { userId: String(userId), farmId: String(id) })
  return true
}

export function listFarmsService(userId: number) {
  return dbList(userId)
}

export function getFarmByIdService(userId: number, id: number) {
  const farm = dbGetById(id)
  if (!farm) return undefined
  if (farm.user_id !== userId) throw new Error("Unauthorized: farm belongs to another user")
  return farm
}

/**
 * Get farm with its associated fields.
 */
export function getFarmWithFieldsService(userId: number, farmId: number) {
  const farm = getFarmByIdService(userId, farmId)
  if (!farm) return undefined
  const fields = listFields(userId)
  const farmFields = fields.filter((f) => f.farm_id === farmId)
  return { ...farm, fields: farmFields }
}

/**
 * Get farm overview with summary statistics.
 */
export function getFarmOverviewService(userId: number, farmId: number) {
  const farm = getFarmByIdService(userId, farmId)
  if (!farm) return undefined
  const fields = listFields(userId).filter((f) => f.farm_id === farmId)
  return {
    ...farm,
    fieldCount: fields.length,
    totalFieldAreaHa: fields.reduce((sum, f) => sum + f.area_ha, 0),
  }
}
