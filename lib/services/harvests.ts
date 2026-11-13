import { createHarvest as dbCreate, updateHarvest as dbUpdate, deleteHarvest as dbDelete } from "@/lib/db"
import { mustPass, HARVEST_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createHarvestService(userId: number, input: any) {
  mustPass(HARVEST_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.HARVEST_CREATED, { userId: String(userId), harvestId: String(row.id) })
  return row
}
export async function updateHarvestService(userId: number, id: number, input: any) {
  mustPass(HARVEST_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.HARVEST_UPDATED, { userId: String(userId), harvestId: String(id) })
  return true
}
export async function deleteHarvestService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.HARVEST_DELETED, { userId: String(userId), harvestId: String(id) })
  return true
}
