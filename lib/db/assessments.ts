import { getDb } from "./getDb";
import { AssessmentRow, SoilMeasurementRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

// --- Assessments ---

export function listAssessments(userId: number) {
  return getDb().prepare(`SELECT * FROM assessments WHERE user_id = ? ORDER BY assessment_date DESC`).all(userId) as AssessmentRow[];
}

export function listAssessmentsByField(fieldId: number) {
  return getDb().prepare(`SELECT * FROM assessments WHERE field_id = ? ORDER BY assessment_date DESC`).all(fieldId) as AssessmentRow[];
}

export function getAssessmentById(id: number): AssessmentRow | undefined {
  return getDb().prepare("SELECT * FROM assessments WHERE id = ?").get(id) as AssessmentRow | undefined;
}

export const createAssessment = withAuditCreate(
  "ASSESSMENT_CREATED",
  (input: {
    userId: number;
    fieldId: number;
    assessmentType: string;
    assessor?: string | null;
    dataSource?: string | null;
    observations?: string | null;
  }): AssessmentRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO assessments (user_id, field_id, assessment_type, assessor, data_source, observations) VALUES (?,?,?,?,?,?)")
      .run(input.userId, input.fieldId, input.assessmentType, input.assessor ?? null, input.dataSource ?? null, input.observations ?? null);
    return getAssessmentById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ assessmentId: row.id }),
);

export const updateAssessment = withAuditUpdate(
  "ASSESSMENT_UPDATED",
  (id: number, input: {
    assessmentType?: string;
    assessor?: string | null;
    dataSource?: string | null;
    status?: string;
    observations?: string | null;
    report?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.assessmentType !== undefined) { fields.push("assessment_type = ?"); values.push(input.assessmentType); }
    if (input.assessor !== undefined) { fields.push("assessor = ?"); values.push(input.assessor); }
    if (input.dataSource !== undefined) { fields.push("data_source = ?"); values.push(input.dataSource); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.observations !== undefined) { fields.push("observations = ?"); values.push(input.observations); }
    if (input.report !== undefined) { fields.push("report = ?"); values.push(input.report); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE assessments SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ assessmentId: id }),
);

export const deleteAssessment = withAuditDelete(
  "ASSESSMENT_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM assessments WHERE id = ?").run(id);
  },
  (id) => ({ assessmentId: id }),
);

// --- Soil Measurements ---

export function listSoilMeasurements(assessmentId: number) {
  return getDb().prepare(`SELECT * FROM soil_measurements WHERE assessment_id = ? ORDER BY created_at`).all(assessmentId) as SoilMeasurementRow[];
}

export const addSoilMeasurement = withAuditCreate(
  "SOIL_MEASUREMENT_ADDED",
  (input: {
    assessmentId: number;
    measurementType: string;
    value: number;
    unit: string;
    sampleId?: string | null;
    method?: string | null;
    source?: string | null;
    referenceRangeMin?: number | null;
    referenceRangeMax?: number | null;
  }): SoilMeasurementRow => {
    const db = getDb();
    const assessment = getAssessmentById(input.assessmentId);
    if (!assessment) throw new Error("Assessment not found");
    const info = db
      .prepare("INSERT INTO soil_measurements (assessment_id, sample_id, measurement_type, value, unit, method, source, reference_range_min, reference_range_max) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(input.assessmentId, input.sampleId ?? null, input.measurementType, input.value, input.unit, input.method ?? null, input.source ?? null, input.referenceRangeMin ?? null, input.referenceRangeMax ?? null);
    return getDb().prepare("SELECT * FROM soil_measurements WHERE id = ?").get(Number(info.lastInsertRowid)) as SoilMeasurementRow;
  },
  () => -1,
  (row) => ({ measurementId: row.id }),
);
