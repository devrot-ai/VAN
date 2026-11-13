import { createPurchase as dbCreate, updatePurchase as dbUpdate, deletePurchase as dbDelete } from "@/lib/db"
import { mustPass, PURCHASE_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createPurchaseService(userId: number, input: any) {
  mustPass(PURCHASE_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.PURCHASE_CREATED, { userId: String(userId), purchaseId: String(row.id) })
  return row
}
export async function updatePurchaseService(userId: number, id: number, input: any) {
  mustPass(PURCHASE_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.PURCHASE_UPDATED, { userId: String(userId), purchaseId: String(id) })
  return true
}
export async function deletePurchaseService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.PURCHASE_DELETED, { userId: String(userId), purchaseId: String(id) })
  return true
}
