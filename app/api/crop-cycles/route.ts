import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createCropCycleService, updateCropCycleService, deleteCropCycleService,
  listCropCyclesService, getCropCycleByIdService,
} from "@/lib/services";
import { badRequest, unauthorized, notFound } from "@/lib/api";

// --- GET /api/crop-cycles — List or get single crop cycle ---
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  if (idParam) {
    const id = Number(idParam);
    if (!Number.isFinite(id)) return badRequest("Crop cycle ID is required.");
    try {
      const cycle = getCropCycleByIdService(user.id, id);
      return NextResponse.json({ ok: true, cycle });
    } catch (err: any) {
      if (err.message?.includes("not found")) return notFound(err.message);
      if (err.message?.includes("Unauthorized")) return unauthorized(err.message);
      return badRequest(err.message ?? "Failed to get crop cycle.");
    }
  }

  try {
    const cycles = listCropCyclesService(user.id);
    return NextResponse.json({ ok: true, cycles });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to list crop cycles.");
  }
}

// --- POST /api/crop-cycles — Create a new crop cycle ---
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  try {
    const cycle = await createCropCycleService(user.id, body);
    return NextResponse.json({ ok: true, cycle });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized(err.message);
    return badRequest(err.message ?? "Failed to create crop cycle.");
  }
}

// --- PUT /api/crop-cycles — Update a crop cycle ---
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return badRequest("Crop cycle ID is required.");

  try {
    const cycle = await updateCropCycleService(user.id, id, body);
    if (!cycle) return notFound("Crop cycle not found.");
    return NextResponse.json({ ok: true, cycle });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized(err.message);
    if (err.message?.includes("not found")) return notFound(err.message);
    return badRequest(err.message ?? "Failed to update crop cycle.");
  }
}

// --- DELETE /api/crop-cycles — Delete a crop cycle ---
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return badRequest("Crop cycle ID is required.");

  try {
    await deleteCropCycleService(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return unauthorized(err.message);
    if (err.message?.includes("not found")) return notFound(err.message);
    return badRequest(err.message ?? "Failed to delete crop cycle.");
  }
}
