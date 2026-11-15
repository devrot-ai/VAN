import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  addSoilMeasurementService,
  listSoilMeasurementsService,
} from "@/lib/services";
import {
  badRequest,
  unauthorized,
  notFound,
  withAuthAndSanitize,
  type CrudField,
} from "@/lib/api";

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

// --- GET /api/measurements?assessmentId=X ---

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const assessmentId = searchParams.get("assessmentId");

  if (!assessmentId) {
    return badRequest("assessmentId query parameter is required.");
  }

  const id = Number(assessmentId);
  if (!Number.isFinite(id)) return badRequest("assessmentId must be a number.");

  try {
    const measurements = listSoilMeasurementsService(user.id, id);
    return NextResponse.json({ ok: true, measurements });
  } catch (err: any) {
    return notFound(err.message ?? "Assessment not found.");
  }
}

// --- POST /api/measurements ---

export const POST = withAuthAndSanitize(
  {},
  measurementFields,
  "SOIL_MEASUREMENT_ADDED",
  (ctx) => ({
    assessmentId: String(ctx.body.assessmentId),
    measurementId: String(ctx.body.measurementId),
  }),
  async (ctx) => {
    try {
      const measurement = await addSoilMeasurementService(ctx.user.id, ctx.body);
      return NextResponse.json({ ok: true, measurement }, { status: 201 });
    } catch (err: any) {
      return badRequest(err.message ?? "Failed to add measurement.");
    }
  },
);
