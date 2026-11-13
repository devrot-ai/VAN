/**
 * Operations users API — role management for operations portal.
 *
 * GET /api/operations/users — list all users (operations only)
 * PUT /api/operations/users — update a user's role (operations only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, forbidden, badRequest, notFound } from "@/lib/api";
import { listAllUsers, getUserById, type SafeUser } from "@/lib/db";
import { getDb } from "@/lib/db/getDb";
import { Role } from "@/lib/db/types";
import { logAudit } from "@/lib/audit";

/** GET — list all users. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "operations") return forbidden("Only operations can view all users.");

  const users = listAllUsers();
  return NextResponse.json({ ok: true, users });
}

/** PUT — update a user's role. */
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "operations") return forbidden("Only operations can manage user roles.");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return badRequest("User ID is required.");

  const existing = getUserById(id);
  if (!existing) return notFound("That user does not exist.");

  const role = body.role as string;
  const validRoles: Role[] = ["farmer", "provider", "cooperative", "buyer", "operations"];
  if (!role || !validRoles.includes(role as Role)) {
    return badRequest(`Role must be one of: ${validRoles.join(", ")}.`);
  }

  const db = getDb();
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);

  logAudit("USER_ROLE_CHANGED", user.id, { targetUserId: id, newRole: role });

  return NextResponse.json({ ok: true });
}
