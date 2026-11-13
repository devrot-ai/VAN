import { createDevice as dbCreate, updateDevice as dbUpdate, deleteDevice as dbDelete } from "@/lib/db"
import { mustPass, DEVICE_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createDeviceService(userId: number, input: any) {
  mustPass(DEVICE_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.DEVICE_CREATED, { userId: String(userId), deviceId: String(row.id) })
  return row
}
export async function updateDeviceService(userId: number, id: number, input: any) {
  mustPass(DEVICE_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.DEVICE_UPDATED, { userId: String(userId), deviceId: String(id) })
  return true
}
export async function deleteDeviceService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.DEVICE_DELETED, { userId: String(userId), deviceId: String(id) })
  return true
}
