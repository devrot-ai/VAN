import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createCropPlanService, updateCropPlanService, getCropPlanByCycleService,
} from "@/lib/services";
import { badRequest, unauthorized } from "@/lib/api";

// GET /api/crop-cycles/[id]/plan — Get crop plan for a cycle
// POST — Create crop plan
// PUT — Update crop plan
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  try {
    const plan = getCropPlanByCycleService(user.id, Number(id));
    return NextResponse.json({ ok: true, plan: plan ?? null });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to get crop plan.");
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
    const plan = await createCropPlanService(user.id, body);
    return NextResponse.json({ ok: true, plan });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to create crop plan.");
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return badRequest("Invalid request body."); }
  const planId = Number(body.planId);
  if (!Number.isFinite(planId)) return badRequest("Plan ID is required.");
  try {
    const plan = await updateCropPlanService(user.id, planId, body);
    return NextResponse.json({ ok: true, plan });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to update crop plan.");
  }
}
