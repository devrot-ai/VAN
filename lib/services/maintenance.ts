import { createMaintenance as dbCreate, updateMaintenance as dbUpdate, deleteMaintenance as dbDelete } from "@/lib/db"
import { mustPass, MAINTENANCE_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createMaintenanceService(userId: number, input: any) {
  mustPass(MAINTENANCE_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.MAINTENANCE_CREATED, { userId: String(userId), maintenanceId: String(row.id) })
  return row
}
export async function updateMaintenanceService(userId: number, id: number, input: any) {
  mustPass(MAINTENANCE_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.MAINTENANCE_UPDATED, { userId: String(userId), maintenanceId: String(id) })
  return true
}
export async function deleteMaintenanceService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.MAINTENANCE_DELETED, { userId: String(userId), maintenanceId: String(id) })
  return true
}
