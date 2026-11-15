import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createInputRequirementService, updateInputRequirementService, deleteInputRequirementService,
  listInputRequirementsByCycleService,
} from "@/lib/services";
import { badRequest, unauthorized } from "@/lib/api";

// GET /api/crop-cycles/[id]/input-requirements — List requirements
// POST — Create requirement
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const requirements = listInputRequirementsByCycleService(user.id, Number(id));
    return NextResponse.json({ ok: true, requirements });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to list input requirements.");
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return badRequest("Invalid request body."); }
  body.cropCycleId = Number(id);
  try {
    const requirement = await createInputRequirementService(user.id, body);
    return NextResponse.json({ ok: true, requirement });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to create input requirement.");
  }
}

// PUT — Update requirement
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return badRequest("Invalid request body."); }
  const reqId = Number(body.requirementId);
  if (!Number.isFinite(reqId)) return badRequest("Requirement ID is required.");
  try {
    const requirement = await updateInputRequirementService(user.id, reqId, body);
    return NextResponse.json({ ok: true, requirement });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to update input requirement.");
  }
}

// DELETE — Delete requirement
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return badRequest("Invalid request body."); }
  const reqId = Number(body.requirementId);
  if (!Number.isFinite(reqId)) return badRequest("Requirement ID is required.");
  try {
    await deleteInputRequirementService(user.id, reqId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to delete input requirement.");
  }
}
