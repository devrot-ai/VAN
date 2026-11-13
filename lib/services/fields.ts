/**
 * lib/services/fields.ts — Field business logic service.
 *
 * Handles validation, DB calls, and event emission for field mutations.
 * Pure functions — testable without HTTP.
 */

import { createField as dbCreate, updateField as dbUpdate, deleteField as dbDelete } from "@/lib/db"
import { mustPass, FIELD_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createFieldService(userId: number, input: any) {
  mustPass(FIELD_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.FIELD_CREATED, { userId: String(userId), fieldId: String(row.id) })
  return row
}

export async function updateFieldService(userId: number, id: number, input: any) {
  mustPass(FIELD_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.FIELD_UPDATED, { userId: String(userId), fieldId: String(id) })
  return true
}

export async function deleteFieldService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.FIELD_DELETED, { userId: String(userId), fieldId: String(id) })
  return true
}
