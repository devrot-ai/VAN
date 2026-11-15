import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createAssessmentService,
  updateAssessmentService,
  deleteAssessmentService,
  listAssessmentsService,
  getAssessmentByIdService,
  addSoilMeasurementService,
  listSoilMeasurementsService,
  getAssessmentReportService,
  approveAssessmentService,
} from "@/lib/services";
import { getAssessmentById } from "@/lib/db/assessments";
import {
  badRequest,
  unauthorized,
  notFound,
  withAuthAndSanitize,
  type CrudField,
} from "@/lib/api";

// --- Shared field definitions ---

const assessmentCreateFields: CrudField[] = [
  { name: "fieldId", type: "integer", required: true },
  { name: "assessmentType", type: "text", required: true, maxLength: 100 },
  { name: "assessor", type: "text", maxLength: 200 },
  { name: "dataSource", type: "text", maxLength: 200 },
  { name: "assessmentDate", type: "text", maxLength: 10 },
  { name: "observations", type: "text", maxLength: 5000 },
];

const assessmentUpdateFields: CrudField[] = [
  { name: "id", type: "integer", required: true },
  { name: "assessmentType", type: "text", maxLength: 100 },
  { name: "assessor", type: "text", maxLength: 200 },
  { name: "dataSource", type: "text", maxLength: 200 },
  { name: "assessmentDate", type: "text", maxLength: 10 },
  { name: "observations", type: "text", maxLength: 5000 },
  { name: "status", type: "text", maxLength: 30 },
  { name: "report", type: "text", maxLength: 5000 },
];

const measurementFields: CrudField[] = [
  { name: "assessmentId", type: "integer", required: true },
  { name: "measurementType", type: "text", required: true, maxLength: 100 },
  { name: "value", type: "number", required: true },
  { name: "unit", type: "text", required: true, maxLength: 50 },
  { name: "sampleId", type: "text", maxLength: 100 },
  { name: "method", type: "text", maxLength: 200 },
  { name: "source", type: "text", maxLength: 200 },
  { name: "referenceRangeMin", type: "number" },
  { name: "referenceRangeMax", type: "number" },
];

// --- GET /api/assessments — list or get by id or get report ---

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const report = searchParams.get("report");

  if (id) {
    const assessmentId = Number(id);
    if (!Number.isFinite(assessmentId)) return badRequest("Assessment ID is required.");

    if (report === "true") {
      const assessment = getAssessmentReportService(user.id, assessmentId);
      if (!assessment) return notFound("Assessment not found.");
      return NextResponse.json({ ok: true, assessment });
    }

    const assessment = getAssessmentByIdService(user.id, assessmentId);
    if (!assessment) return notFound("Assessment not found.");
    return NextResponse.json({ ok: true, assessment });
  }

  const assessments = listAssessmentsService(user.id);
  return NextResponse.json({ ok: true, assessments });
}

// --- POST /api/assessments — create new assessment ---

export const POST = withAuthAndSanitize(
  {},
  assessmentCreateFields,
  "ASSESSMENT_CREATED",
  (ctx) => ({ assessmentId: String(ctx.body.assessmentId) }),
  async (ctx) => {
    try {
      const assessment = await createAssessmentService(ctx.user.id, ctx.body);
      return NextResponse.json({ ok: true, assessment }, { status: 201 });
    } catch (err: any) {
      return badRequest(err.message ?? "Failed to create assessment.");
    }
  },
);

// --- PUT /api/assessments — update assessment ---

export const PUT = withAuthAndSanitize(
  {},
  assessmentUpdateFields,
  "ASSESSMENT_UPDATED",
  (ctx) => ({ assessmentId: String(ctx.body.id) }),
  async (ctx) => {
    const id = ctx.body.id as number;
    const existing = getAssessmentById(id);
    if (!existing || existing.user_id !== ctx.user.id) {
      return notFound("Assessment not found or does not belong to you.");
    }

    const updates = { ...ctx.body };
    delete updates.id;

    try {
      await updateAssessmentService(ctx.user.id, id, updates);
      return NextResponse.json({ ok: true });
    } catch (err: any) {
      return badRequest(err.message ?? "Failed to update assessment.");
    }
  },
);

// --- DELETE /api/assessments — delete assessment ---

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
  if (!Number.isFinite(id)) return badRequest("Assessment ID is required.");

  const existing = getAssessmentById(id);
  if (!existing || existing.user_id !== user.id) {
    return notFound("Assessment not found or does not belong to you.");
  }

  try {
    await deleteAssessmentService(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return badRequest(err.message ?? "Failed to delete assessment.");
  }
}
