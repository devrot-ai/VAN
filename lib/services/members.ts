import { createMember as dbCreate, updateMember as dbUpdate, deleteMember as dbDelete } from "@/lib/db"
import { mustPass, MEMBER_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createMemberService(userId: number, input: any) {
  mustPass(MEMBER_SCHEMA, input)
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.MEMBER_CREATED, { userId: String(userId), memberId: String(row.id) })
  return row
}
export async function updateMemberService(userId: number, id: number, input: any) {
  mustPass(MEMBER_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.MEMBER_UPDATED, { userId: String(userId), memberId: String(id) })
  return true
}
export async function deleteMemberService(userId: number, id: number) {
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.MEMBER_DELETED, { userId: String(userId), memberId: String(id) })
  return true
}
