import { createTransaction as dbCreate, updateTransaction as dbUpdate, deleteTransaction as dbDelete } from "@/lib/db"
import { mustPass, TRANSACTION_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createTransactionService(userId: number, input: any) {
  mustPass(TRANSACTION_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.TRANSACTION_CREATED, { userId: String(userId), transactionId: String(row.id) })
  return row
}
export async function updateTransactionService(userId: number, id: number, input: any) {
  mustPass(TRANSACTION_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.TRANSACTION_UPDATED, { userId: String(userId), transactionId: String(id) })
  return true
}
export async function deleteTransactionService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.TRANSACTION_DELETED, { userId: String(userId), transactionId: String(id) })
  return true
}
