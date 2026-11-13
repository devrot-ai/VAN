import { createEquipment as dbCreate, updateEquipment as dbUpdate, deleteEquipment as dbDelete } from "@/lib/db"
import { mustPass, EQUIPMENT_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createEquipmentService(userId: number, input: any) {
  mustPass(EQUIPMENT_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.EQUIPMENT_CREATED, { userId: String(userId), equipmentId: String(row.id) })
  return row
}
export async function updateEquipmentService(userId: number, id: number, input: any) {
  mustPass(EQUIPMENT_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.EQUIPMENT_UPDATED, { userId: String(userId), equipmentId: String(id) })
  return true
}
export async function deleteEquipmentService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.EQUIPMENT_DELETED, { userId: String(userId), equipmentId: String(id) })
  return true
}
