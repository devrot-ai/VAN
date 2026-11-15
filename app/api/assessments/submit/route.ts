import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { submitAssessmentService } from "@/lib/services";
import { badRequest, unauthorized } from "@/lib/api";

// --- POST /api/assessments/submit ---
// Farmers can submit their own assessments for review.

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return badRequest("Assessment ID is required.");

  try {
    const assessment = await submitAssessmentService(user.id, id);
    return NextResponse.json({ ok: true, assessment });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to submit assessment.");
  }
}
