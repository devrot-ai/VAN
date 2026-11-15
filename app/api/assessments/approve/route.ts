import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { approveAssessmentService } from "@/lib/services";
import { badRequest, unauthorized, notFound, forbidden } from "@/lib/api";

// --- POST /api/assessments/approve ---
// Only VAN operations personnel can approve assessments.

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  // Enforce role-based approval: only "operations" role can approve
  if (user.role !== "operations") {
    return forbidden("Only VAN operations personnel can approve assessments.");
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return badRequest("Assessment ID is required.");

  const report = body.report ? String(body.report).slice(0, 5000) : undefined;

  try {
    const assessment = await approveAssessmentService(user.id, user.role, id, report);
    return NextResponse.json({ ok: true, assessment });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to approve assessment.");
  }
}
