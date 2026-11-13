/**
 * Purchase status transition API — buyer purchase flow.
 *
 * POST /api/purchases/respond — transition purchase status
 * (enquiry → offer → confirmed → delivered)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, forbidden, badRequest, notFound } from "@/lib/api";
import { getPurchaseById, listPurchases } from "@/lib/db";
import { getDb } from "@/lib/db/getDb";
import { logAudit } from "@/lib/audit";

const VALID_TRANSITIONS: Record<string, string[]> = {
  enquiry: ["offer", "declined"],
  offer: ["confirmed", "declined"],
  confirmed: ["delivered"],
  delivered: [],
};

/** POST — transition purchase status. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "buyer") return forbidden("Only buyers can manage purchase status.");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return badRequest("Purchase ID is required.");

  const purchase = getPurchaseById(id);
  if (!purchase || purchase.user_id !== user.id) {
    return notFound("That purchase does not belong to your account.");
  }

  const newStatus = body.status as string;
  const allowed = VALID_TRANSITIONS[purchase.status] ?? [];
  if (!newStatus || !allowed.includes(newStatus)) {
    return badRequest(`Invalid status transition from "${purchase.status}". Allowed: ${allowed.join(", ") || "none"}.`);
  }

  const db = getDb();
  db.prepare("UPDATE purchases SET status = ? WHERE id = ?").run(newStatus, id);

  logAudit("PURCHASE_STATUS_CHANGED", user.id, {
    purchaseId: id,
    fromStatus: purchase.status,
    toStatus: newStatus,
  });

  return NextResponse.json({ ok: true });
}
