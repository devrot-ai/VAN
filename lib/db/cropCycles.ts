import { getDb } from "./getDb";
import { CropCycleRow, CropPlanRow, CropCycleStageRow, InputRequirementRow } from "./types";
import { withAuditCreate, withAuditUpdate, withAuditDelete } from "@/lib/audit";

// ==================== CROP CYCLES ====================

export function listCropCycles(userId: number) {
  return getDb().prepare(`SELECT * FROM crop_cycles WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as CropCycleRow[];
}

export function listCropCyclesByField(fieldId: number) {
  return getDb().prepare(`SELECT * FROM crop_cycles WHERE field_id = ? ORDER BY created_at DESC`).all(fieldId) as CropCycleRow[];
}

export function listCropCyclesByFarm(farmId: number) {
  const db = getDb();
  const fieldIds = db.prepare("SELECT id FROM fields WHERE farm_id = ?").all(farmId) as { id: number }[];
  if (fieldIds.length === 0) return [];
  const placeholders = fieldIds.map(() => "?").join(",");
  return db.prepare(`SELECT * FROM crop_cycles WHERE field_id IN (${placeholders}) ORDER BY created_at DESC`).all(...fieldIds.map(f => f.id)) as CropCycleRow[];
}

export function getCropCycleById(id: number): CropCycleRow | undefined {
  return getDb().prepare("SELECT * FROM crop_cycles WHERE id = ?").get(id) as CropCycleRow | undefined;
}

export function getCropCycleWithDetails(id: number): (CropCycleRow & {
  farm_name: string | null;
  field_name: string | null;
  assessment_id: number | null;
  assessment_status: string | null;
}) | undefined {
  return getDb().prepare(`
    SELECT cc.*, f.name as farm_name, fl.name as field_name, a.id as assessment_id, a.status as assessment_status
    FROM crop_cycles cc
    JOIN fields fl ON cc.field_id = fl.id
    LEFT JOIN farms f ON fl.farm_id = f.id
    LEFT JOIN assessments a ON cc.assessment_id = a.id
    WHERE cc.id = ?
  `).get(id) as any;
}

export const createCropCycle = withAuditCreate(
  "CROP_CYCLE_CREATED",
  (input: {
    userId: number;
    fieldId: number;
    assessmentId?: number | null;
    cropType: string;
    variety?: string | null;
    season?: string | null;
    cultivatedAreaHa?: number | null;
    plannedStartDate?: string | null;
    plannedPlantingDate?: string | null;
    plannedHarvestDate?: string | null;
    notes?: string | null;
  }): CropCycleRow => {
    const db = getDb();
    const info = db
      .prepare("INSERT INTO crop_cycles (user_id, field_id, assessment_id, crop_type, variety, season, cultivated_area_ha, planned_start_date, planned_planting_date, planned_harvest_date, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .run(input.userId, input.fieldId, input.assessmentId ?? null, input.cropType, input.variety ?? null, input.season ?? null, input.cultivatedAreaHa ?? null, input.plannedStartDate ?? null, input.plannedPlantingDate ?? null, input.plannedHarvestDate ?? null, input.notes ?? null);
    return getCropCycleById(Number(info.lastInsertRowid))!;
  },
  (input) => input.userId,
  (row) => ({ cropCycleId: row.id }),
);

export const updateCropCycle = withAuditUpdate(
  "CROP_CYCLE_UPDATED",
  (id: number, input: {
    assessmentId?: number | null;
    cropType?: string;
    variety?: string | null;
    season?: string | null;
    cultivatedAreaHa?: number | null;
    plannedStartDate?: string | null;
    plannedPlantingDate?: string | null;
    plannedHarvestDate?: string | null;
    actualStartDate?: string | null;
    actualPlantingDate?: string | null;
    actualHarvestDate?: string | null;
    stage?: string;
    status?: string;
    notes?: string | null;
  }, _userId: number): void => {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    if (input.assessmentId !== undefined) { fields.push("assessment_id = ?"); values.push(input.assessmentId); }
    if (input.cropType !== undefined) { fields.push("crop_type = ?"); values.push(input.cropType); }
    if (input.variety !== undefined) { fields.push("variety = ?"); values.push(input.variety); }
    if (input.season !== undefined) { fields.push("season = ?"); values.push(input.season); }
    if (input.cultivatedAreaHa !== undefined) { fields.push("cultivated_area_ha = ?"); values.push(input.cultivatedAreaHa); }
    if (input.plannedStartDate !== undefined) { fields.push("planned_start_date = ?"); values.push(input.plannedStartDate); }
    if (input.plannedPlantingDate !== undefined) { fields.push("planned_planting_date = ?"); values.push(input.plannedPlantingDate); }
    if (input.plannedHarvestDate !== undefined) { fields.push("planned_harvest_date = ?"); values.push(input.plannedHarvestDate); }
    if (input.actualStartDate !== undefined) { fields.push("actual_start_date = ?"); values.push(input.actualStartDate); }
    if (input.actualPlantingDate !== undefined) { fields.push("actual_planting_date = ?"); values.push(input.actualPlantingDate); }
    if (input.actualHarvestDate !== undefined) { fields.push("actual_harvest_date = ?"); values.push(input.actualHarvestDate); }
    if (input.stage !== undefined) { fields.push("stage = ?"); values.push(input.stage); }
    if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
    if (input.notes !== undefined) { fields.push("notes = ?"); values.push(input.notes); }
    if (fields.length === 0) return;
    values.push(id);
    db.prepare(`UPDATE crop_cycles SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  },
  (id) => ({ cropCycleId: id }),
);

export const deleteCropCycle = withAuditDelete(
  "CROP_CYCLE_DELETED",
  (id: number, _userId: number): void => {
    getDb().prepare("DELETE FROM crop_cycles WHERE id = ?").run(id);
  },
  (id) => ({ cropCycleId: id }),
);

// ==================== CROP PLANS ====================

export function getCropPlanByCycle(cropCycleId: number): CropPlanRow | undefined {
  return getDb().prepare("SELECT * FROM crop_plans WHERE crop_cycle_id = ? ORDER BY created_at DESC LIMIT 1").get(cropCycleId) as CropPlanRow | undefined;
}

export function createCropPlan(input: {
  cropCycleId: number;
  plantingMethod?: string | null;
  irrigationApproach?: string | null;
  fieldConditions?: string | null;
  planningNotes?: string | null;
  createdBy: number;
}): CropPlanRow {
  const db = getDb();
  const info = db.prepare(`
    INSERT INTO crop_plans (crop_cycle_id, planting_method, irrigation_approach, field_conditions, planning_notes, created_by)
    VALUES (?,?,?,?,?,?)
  `).run(input.cropCycleId, input.plantingMethod ?? null, input.irrigationApproach ?? null, input.fieldConditions ?? null, input.planningNotes ?? null, input.createdBy);
  return getCropPlanById(Number(info.lastInsertRowid))!;
}

export function getCropPlanById(id: number): CropPlanRow | undefined {
  return getDb().prepare("SELECT * FROM crop_plans WHERE id = ?").get(id) as CropPlanRow | undefined;
}

export function updateCropPlan(id: number, input: {
  plantingMethod?: string | null;
  irrigationApproach?: string | null;
  fieldConditions?: string | null;
  planningNotes?: string | null;
  status?: string;
}): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (input.plantingMethod !== undefined) { fields.push("planting_method = ?"); values.push(input.plantingMethod); }
  if (input.irrigationApproach !== undefined) { fields.push("irrigation_approach = ?"); values.push(input.irrigationApproach); }
  if (input.fieldConditions !== undefined) { fields.push("field_conditions = ?"); values.push(input.fieldConditions); }
  if (input.planningNotes !== undefined) { fields.push("planning_notes = ?"); values.push(input.planningNotes); }
  if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE crop_plans SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

// ==================== CROP CYCLE STAGES ====================

export function listStagesByCycle(cropCycleId: number) {
  return getDb().prepare("SELECT * FROM crop_cycle_stages WHERE crop_cycle_id = ? ORDER BY sequence ASC, id ASC").all(cropCycleId) as CropCycleStageRow[];
}

export function getCropStageById(id: number): CropCycleStageRow | undefined {
  return getDb().prepare("SELECT * FROM crop_cycle_stages WHERE id = ?").get(id) as CropCycleStageRow | undefined;
}

export function createCropStage(input: {
  cropCycleId: number;
  stageName: string;
  sequence?: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  description?: string | null;
  responsiblePerson?: string | null;
  notes?: string | null;
}): CropCycleStageRow {
  const db = getDb();
  const row = db.prepare("SELECT COALESCE(MAX(sequence), -1) + 1 AS next_seq FROM crop_cycle_stages WHERE crop_cycle_id = ?").get(input.cropCycleId) as { next_seq: number } | undefined;
  const sequence = input.sequence ?? (row?.next_seq ?? 0);
  const info = db.prepare(`
    INSERT INTO crop_cycle_stages (crop_cycle_id, stage_name, sequence, planned_start_date, planned_end_date, description, responsible_person, notes)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(input.cropCycleId, input.stageName, sequence, input.plannedStartDate ?? null, input.plannedEndDate ?? null, input.description ?? null, input.responsiblePerson ?? null, input.notes ?? null);
  return getCropStageById(Number(info.lastInsertRowid))!;
}

export function updateCropStage(id: number, input: {
  stageName?: string;
  sequence?: number;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  status?: string;
  description?: string | null;
  responsiblePerson?: string | null;
  notes?: string | null;
}): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (input.stageName !== undefined) { fields.push("stage_name = ?"); values.push(input.stageName); }
  if (input.sequence !== undefined) { fields.push("sequence = ?"); values.push(input.sequence); }
  if (input.plannedStartDate !== undefined) { fields.push("planned_start_date = ?"); values.push(input.plannedStartDate); }
  if (input.plannedEndDate !== undefined) { fields.push("planned_end_date = ?"); values.push(input.plannedEndDate); }
  if (input.actualStartDate !== undefined) { fields.push("actual_start_date = ?"); values.push(input.actualStartDate); }
  if (input.actualEndDate !== undefined) { fields.push("actual_end_date = ?"); values.push(input.actualEndDate); }
  if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
  if (input.description !== undefined) { fields.push("description = ?"); values.push(input.description); }
  if (input.responsiblePerson !== undefined) { fields.push("responsible_person = ?"); values.push(input.responsiblePerson); }
  if (input.notes !== undefined) { fields.push("notes = ?"); values.push(input.notes); }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE crop_cycle_stages SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteCropStage(id: number): void {
  getDb().prepare("DELETE FROM crop_cycle_stages WHERE id = ?").run(id);
}

// ==================== INPUT REQUIREMENTS ====================

export function listInputRequirementsByCycle(cropCycleId: number) {
  return getDb().prepare("SELECT * FROM input_requirements WHERE crop_cycle_id = ? ORDER BY created_at DESC").all(cropCycleId) as InputRequirementRow[];
}

export function listInputRequirementsByUser(userId: number) {
  return getDb().prepare("SELECT * FROM input_requirements WHERE user_id = ? ORDER BY created_at DESC").all(userId) as InputRequirementRow[];
}

export function getInputRequirementById(id: number): InputRequirementRow | undefined {
  return getDb().prepare("SELECT * FROM input_requirements WHERE id = ?").get(id) as InputRequirementRow | undefined;
}

export function createInputRequirement(input: {
  userId: number;
  farmId?: number | null;
  fieldId?: number | null;
  cropCycleId: number;
  cropPlanId?: number | null;
  inputCatalogueId?: number | null;
  inputCategory: string;
  productName?: string | null;
  plannedQuantity: number;
  unit: string;
  ratePerHa?: number | null;
  plannedApplicationDate?: string | null;
  intendedPurpose?: string | null;
  estimatedUnitPrice?: number | null;
  estimatedTotalCost?: number | null;
  createdBy: number;
  notes?: string | null;
}): InputRequirementRow {
  const db = getDb();
  const info = db.prepare(`
    INSERT INTO input_requirements (user_id, farm_id, field_id, crop_cycle_id, crop_plan_id, input_catalogue_id, input_category, product_name, planned_quantity, unit, rate_per_ha, planned_application_date, intended_purpose, estimated_unit_price, estimated_total_cost, created_by, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    input.userId, input.farmId ?? null, input.fieldId ?? null, input.cropCycleId, input.cropPlanId ?? null,
    input.inputCatalogueId ?? null, input.inputCategory, input.productName ?? null, input.plannedQuantity,
    input.unit, input.ratePerHa ?? null, input.plannedApplicationDate ?? null, input.intendedPurpose ?? null,
    input.estimatedUnitPrice ?? null, input.estimatedTotalCost ?? null, input.createdBy, input.notes ?? null
  );
  return getInputRequirementById(Number(info.lastInsertRowid))!;
}

export function updateInputRequirement(id: number, input: {
  inputCategory?: string;
  productName?: string | null;
  plannedQuantity?: number;
  unit?: string;
  ratePerHa?: number | null;
  plannedApplicationDate?: string | null;
  intendedPurpose?: string | null;
  estimatedUnitPrice?: number | null;
  estimatedTotalCost?: number | null;
  status?: string;
  notes?: string | null;
}): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (input.inputCategory !== undefined) { fields.push("input_category = ?"); values.push(input.inputCategory); }
  if (input.productName !== undefined) { fields.push("product_name = ?"); values.push(input.productName); }
  if (input.plannedQuantity !== undefined) { fields.push("planned_quantity = ?"); values.push(input.plannedQuantity); }
  if (input.unit !== undefined) { fields.push("unit = ?"); values.push(input.unit); }
  if (input.ratePerHa !== undefined) { fields.push("rate_per_ha = ?"); values.push(input.ratePerHa); }
  if (input.plannedApplicationDate !== undefined) { fields.push("planned_application_date = ?"); values.push(input.plannedApplicationDate); }
  if (input.intendedPurpose !== undefined) { fields.push("intended_purpose = ?"); values.push(input.intendedPurpose); }
  if (input.estimatedUnitPrice !== undefined) { fields.push("estimated_unit_price = ?"); values.push(input.estimatedUnitPrice); }
  if (input.estimatedTotalCost !== undefined) { fields.push("estimated_total_cost = ?"); values.push(input.estimatedTotalCost); }
  if (input.status !== undefined) { fields.push("status = ?"); values.push(input.status); }
  if (input.notes !== undefined) { fields.push("notes = ?"); values.push(input.notes); }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE input_requirements SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteInputRequirement(id: number): void {
  getDb().prepare("DELETE FROM input_requirements WHERE id = ?").run(id);
}
