import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createCropStageService, updateCropStageService, deleteCropStageService, listStagesByCycleService,
} from "@/lib/services";
import { badRequest, unauthorized } from "@/lib/api";

// GET /api/crop-cycles/[id]/stages — List stages
// POST — Create stage
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const stages = listStagesByCycleService(user.id, Number(id));
    return NextResponse.json({ ok: true, stages });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to list stages.");
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
    const stage = await createCropStageService(user.id, body);
    return NextResponse.json({ ok: true, stage });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to create stage.");
  }
}

// PUT — Update stage
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return badRequest("Invalid request body."); }
  const stageId = Number(body.stageId);
  if (!Number.isFinite(stageId)) return badRequest("Stage ID is required.");
  try {
    const stage = await updateCropStageService(user.id, stageId, body);
    return NextResponse.json({ ok: true, stage });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to update stage.");
  }
}

// DELETE — Delete stage
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return badRequest("Invalid request body."); }
  const stageId = Number(body.stageId);
  if (!Number.isFinite(stageId)) return badRequest("Stage ID is required.");
  try {
    await deleteCropStageService(user.id, stageId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to delete stage.");
  }
}
