import { createActivity as dbCreate, updateActivity as dbUpdate, deleteActivity as dbDelete } from "@/lib/db"
import { mustPass, ACTIVITY_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createActivityService(userId: number, input: any) {
  mustPass(ACTIVITY_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.ACTIVITY_CREATED, { userId: String(userId), activityId: String(row.id) })
  return row
}
export async function updateActivityService(userId: number, id: number, input: any) {
  mustPass(ACTIVITY_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.ACTIVITY_UPDATED, { userId: String(userId), activityId: String(id) })
  return true
}
export async function deleteActivityService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.ACTIVITY_DELETED, { userId: String(userId), activityId: String(id) })
  return true
}
