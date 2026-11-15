import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import {
  createAssessmentService,
  updateAssessmentService,
  deleteAssessmentService,
  approveAssessmentService,
  submitAssessmentService,
  addSoilMeasurementService,
  listAssessmentsService,
  getAssessmentByIdService,
} from "./assessments";
import { createField, getFieldById } from "../db/fields";
import { createFarm } from "../db/farms";

describe("assessments service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let farmerId: number;
  let opsId: number;
  let fieldId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    farmerId = createTestUser(db, "farmer", "Farmer", "farmer@test.com");
    opsId = createTestUser(db, "operations", "Ops", "ops@test.com");
    const farm = createFarm({ userId: farmerId, name: "Farm", address: "Addr", totalAreaHa: 50, status: "active" });
    const field = createField({ userId: farmerId, name: "Field", areaHa: 10, farmId: farm.id, crop: null, status: null, notes: null });
    fieldId = field.id;
  });

  afterEach(() => teardownTestDb());

  it("creates an assessment", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    expect(a.id).toBeDefined();
    expect(a.field_id).toBe(fieldId);
    expect(a.status).toBe("draft");
  });

  it("rejects assessment on another user's field", async () => {
    const otherId = createTestUser(db, "farmer", "Other", "other1@test.com");
    const farm = createFarm({ userId: otherId, name: "Other", address: "X", totalAreaHa: 30, status: "active" });
    const field = createField({ userId: otherId, name: "F", areaHa: 5, farmId: farm.id, crop: null, status: null, notes: null });
    await expect(createAssessmentService(farmerId, { fieldId: field.id, assessmentType: "soil_testing" })).rejects.toThrow("Unauthorized");
  });

  it("adds measurement", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    const m = await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    expect(m.value).toBe(6.5);
  });

  it("rejects measurement on another user's assessment", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await expect(addSoilMeasurementService(opsId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" })).rejects.toThrow("Unauthorized");
  });

  it("farmer cannot approve own assessment", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    await expect(approveAssessmentService(farmerId, "farmer", a.id)).rejects.toThrow("Only VAN operations");
  });

  it("operations can approve", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    const approved = await approveAssessmentService(opsId, "operations", a.id);
    expect(approved.status).toBe("approved");
  });

  it("rejects approve without measurements", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await expect(approveAssessmentService(opsId, "operations", a.id)).rejects.toThrow("without measurements");
  });

  it("rejects double approval", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    await approveAssessmentService(opsId, "operations", a.id);
    await expect(approveAssessmentService(opsId, "operations", a.id)).rejects.toThrow("already approved");
  });

  it("submits draft for review", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    const submitted = await submitAssessmentService(farmerId, a.id);
    expect(submitted.status).toBe("under_review");
  });

  it("rejects submit without measurements", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await expect(submitAssessmentService(farmerId, a.id)).rejects.toThrow("without measurements");
  });

  it("protects approved from modification", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    await approveAssessmentService(opsId, "operations", a.id);
    await expect(updateAssessmentService(farmerId, a.id, { observations: "x" })).rejects.toThrow("Approved assessments cannot be modified");
  });

  it("protects approved from deletion", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    await approveAssessmentService(opsId, "operations", a.id);
    await expect(deleteAssessmentService(farmerId, a.id)).rejects.toThrow("approved");
  });

  it("protects under_review from deletion", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await addSoilMeasurementService(farmerId, { assessmentId: a.id, measurementType: "pH", value: 6.5, unit: "pH" });
    await submitAssessmentService(farmerId, a.id);
    await expect(deleteAssessmentService(farmerId, a.id)).rejects.toThrow("under_review");
  });

  it("allows deleting draft", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await expect(deleteAssessmentService(farmerId, a.id)).resolves.toBeTruthy();
  });

  it("rejects arbitrary status change", async () => {
    const a = await createAssessmentService(farmerId, { fieldId, assessmentType: "soil_testing" });
    await expect(updateAssessmentService(farmerId, a.id, { status: "approved" })).rejects.toThrow("Invalid status transition");
  });

  it("rejects getting another user's assessment", async () => {
    const otherId = createTestUser(db, "farmer", "Other2", "other2@test.com");
    const farm = createFarm({ userId: otherId, name: "Other", address: "X", totalAreaHa: 30, status: "active" });
    const field = createField({ userId: otherId, name: "F", areaHa: 5, farmId: farm.id, crop: null, status: null, notes: null });
    const a = await createAssessmentService(otherId, { fieldId: field.id, assessmentType: "soil_testing" });
    expect(() => getAssessmentByIdService(farmerId, a.id)).toThrow("Unauthorized");
  });
});
