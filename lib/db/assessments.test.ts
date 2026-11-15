import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listAssessments, listAssessmentsByField, getAssessmentById, createAssessment, updateAssessment, deleteAssessment, listSoilMeasurements, addSoilMeasurement } from "./assessments";
import { createField } from "./fields";

describe("assessments module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let fieldId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const field = createField({ userId, name: "North Field", areaHa: 5 });
    fieldId = field.id;
  });

  afterAll(() => teardownTestDb());

  describe("createAssessment", () => {
    it("creates an assessment linked to a field", () => {
      const assessment = createAssessment({
        userId,
        fieldId,
        assessmentType: "soil_testing",
        assessor: "Dr. Sharma",
        dataSource: "Lab Report",
        observations: "Soil appears dry",
      });
      expect(assessment.id).toBeGreaterThan(0);
      expect(assessment.user_id).toBe(userId);
      expect(assessment.field_id).toBe(fieldId);
      expect(assessment.assessment_type).toBe("soil_testing");
      expect(assessment.status).toBe("draft");
    });

    it("creates with minimal fields", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "field_inspection" });
      expect(assessment.assessor).toBeNull();
      expect(assessment.data_source).toBeNull();
    });
  });

  describe("listAssessments", () => {
    it("returns empty when no assessments exist", () => {
      expect(listAssessments(userId)).toEqual([]);
    });

    it("returns assessments for the user", () => {
      createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      createAssessment({ userId, fieldId, assessmentType: "field_inspection" });
      expect(listAssessments(userId)).toHaveLength(2);
    });
  });

  describe("listAssessmentsByField", () => {
    it("returns assessments for a specific field", () => {
      const field2 = createField({ userId, name: "South Field", areaHa: 3 });
      createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      createAssessment({ userId, fieldId: field2.id, assessmentType: "field_inspection" });
      expect(listAssessmentsByField(fieldId)).toHaveLength(1);
      expect(listAssessmentsByField(field2.id)).toHaveLength(1);
    });
  });

  describe("updateAssessment", () => {
    it("updates status to approved", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      updateAssessment(assessment.id, { status: "approved", report: "Soil pH is optimal" }, userId);
      const updated = getAssessmentById(assessment.id)!;
      expect(updated.status).toBe("approved");
      expect(updated.report).toBe("Soil pH is optimal");
    });

    it("updates through workflow states", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      updateAssessment(assessment.id, { status: "sample_collection" }, userId);
      expect(getAssessmentById(assessment.id)!.status).toBe("sample_collection");
      updateAssessment(assessment.id, { status: "results_pending" }, userId);
      expect(getAssessmentById(assessment.id)!.status).toBe("results_pending");
      updateAssessment(assessment.id, { status: "under_review" }, userId);
      expect(getAssessmentById(assessment.id)!.status).toBe("under_review");
      updateAssessment(assessment.id, { status: "approved" }, userId);
      expect(getAssessmentById(assessment.id)!.status).toBe("approved");
    });
  });

  describe("deleteAssessment", () => {
    it("deletes an assessment", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      deleteAssessment(assessment.id, userId);
      expect(getAssessmentById(assessment.id)).toBeUndefined();
    });
  });

  describe("addSoilMeasurement", () => {
    it("adds a soil measurement to an assessment", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      const measurement = addSoilMeasurement({
        assessmentId: assessment.id,
        measurementType: "pH",
        value: 6.5,
        unit: "pH",
        method: "Lab analysis",
        source: "State Agri Lab",
        sampleId: "S-001",
        referenceRangeMin: 6.0,
        referenceRangeMax: 7.5,
      });
      expect(measurement.id).toBeGreaterThan(0);
      expect(measurement.assessment_id).toBe(assessment.id);
      expect(measurement.measurement_type).toBe("pH");
      expect(measurement.value).toBe(6.5);
      expect(measurement.unit).toBe("pH");
      expect(measurement.validation_status).toBe("pending");
    });

    it("throws when assessment not found", () => {
      expect(() => addSoilMeasurement({
        assessmentId: 999,
        measurementType: "pH",
        value: 6.5,
        unit: "pH",
      })).toThrow("Assessment not found");
    });
  });

  describe("listSoilMeasurements", () => {
    it("returns measurements for an assessment", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "soil_testing" });
      addSoilMeasurement({ assessmentId: assessment.id, measurementType: "pH", value: 6.5, unit: "pH" });
      addSoilMeasurement({ assessmentId: assessment.id, measurementType: "nitrogen", value: 45, unit: "kg/ha" });
      addSoilMeasurement({ assessmentId: assessment.id, measurementType: "phosphorus", value: 22, unit: "kg/ha" });
      expect(listSoilMeasurements(assessment.id)).toHaveLength(3);
    });

    it("returns empty for assessment with no measurements", () => {
      const assessment = createAssessment({ userId, fieldId, assessmentType: "field_inspection" });
      expect(listSoilMeasurements(assessment.id)).toEqual([]);
    });
  });

  describe("multiple assessments per field", () => {
    it("supports multiple assessments on the same field", () => {
      createAssessment({ userId, fieldId, assessmentType: "soil_testing", observations: "Initial" });
      createAssessment({ userId, fieldId, assessmentType: "follow_up", observations: "After fertilization" });
      expect(listAssessmentsByField(fieldId)).toHaveLength(2);
    });
  });
});
