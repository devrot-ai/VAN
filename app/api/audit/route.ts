/**
 * Audit log API — query audit events for operations portal.
 *
 * GET /api/audit — list recent audit log entries (operations only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/api";
import { getDb } from "@/lib/db/getDb";

/** GET — list recent audit log entries. */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "operations") return forbidden("Only operations can view audit logs.");

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 100, 500);
  const offset = Number(req.nextUrl.searchParams.get("offset")) || 0;

  // Check if audit_log table exists; if not, return empty
  const db = getDb();
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_log'").all() as { name: string }[];
  if (!tables.length) {
    return NextResponse.json({ ok: true, entries: [], total: 0 });
  }

  const totalRow = db.prepare("SELECT COUNT(*) as count FROM audit_log").get() as { count: number };
  const entries = db.prepare(
    "SELECT * FROM audit_log ORDER BY id DESC LIMIT ? OFFSET ?",
  ).all(limit, offset) as Record<string, unknown>[];

  return NextResponse.json({ ok: true, entries, total: totalRow.count });
}
