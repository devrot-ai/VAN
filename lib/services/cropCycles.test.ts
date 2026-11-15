/**
 * lib/services/cropCycles.test.ts — Crop cycle, plan, stage and input requirement service tests.
 *
 * Tests the complete crop planning workflow:
 * - Crop cycle CRUD with assessment validation
 * - Cultivated area validation
 * - Date validation
 * - Status transitions
 * - Crop plan creation and update
 * - Crop stage management
 * - Input requirement creation with cost calculation
 * - Cross-organisation isolation
 */

import { describe, it, expect, beforeEach, afterAll } from "vitest"
import { setupTestDb, teardownTestDb, clearTestDb } from "@/lib/testDb"
import {
  createCropCycleService, updateCropCycleService, deleteCropCycleService,
  listCropCyclesService, getCropCycleByIdService, changeCropCycleStatusService,
  createCropPlanService, updateCropPlanService, getCropPlanByCycleService,
  createCropStageService, updateCropStageService, deleteCropStageService, listStagesByCycleService,
  createInputRequirementService, updateInputRequirementService, deleteInputRequirementService,
  listInputRequirementsByCycleService,
} from "@/lib/services"
import { createFarm } from "@/lib/db/farms"
import { createField } from "@/lib/db/fields"
import { createUser } from "@/lib/db/users"
import { createAssessment, addSoilMeasurement, updateAssessment } from "@/lib/db/assessments"
import { getDb } from "@/lib/db/getDb"

let db: any
let farmerId: number
let farmId: number
let fieldId: number
let assessmentId: number

beforeEach(() => {
  db = setupTestDb()
  clearTestDb(db)

  const farmer = createUser({ name: "Farmer", email: "farmer@test.com", passwordHash: "hashed_password", role: "farmer" })
  farmerId = farmer.id

  const farm = createFarm({ userId: farmerId, name: "Test Farm", address: "Test Address", totalAreaHa: 50 })
  farmId = farm.id

  const field = createField({ userId: farmerId, name: "Test Field", areaHa: 10, farmId: farmId, crop: null, status: null, notes: null })
  fieldId = field.id

  // Create and approve an assessment for the field
  const assessment = createAssessment({
    userId: farmerId,
    fieldId,
    assessmentType: "soil_testing",
    assessor: "Dr. Test",
    assessmentDate: "2025-01-15",
    observations: null,
  })
  assessmentId = assessment.id
  addSoilMeasurement({
    userId: farmerId,
    assessmentId,
    measurementType: "pH",
    value: 6.5,
    unit: "pH",
    source: "Lab Test",
    sampleRef: null,
    method: null,
    collectionDate: "2025-01-15",
  })
  updateAssessment(assessmentId, { status: "approved" }, farmerId)
})

afterAll(() => teardownTestDb())

describe("Crop cycle service", () => {
  it("creates a crop cycle for an authorised field", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
      variety: "PBW 343",
      season: "Rabi 2025",
      cultivatedAreaHa: 8,
      plannedPlantingDate: "2025-10-15",
      plannedHarvestDate: "2026-03-15",
    })
    expect(cycle.id).toBeDefined()
    expect(cycle.crop_type).toBe("Wheat")
    expect(cycle.cultivated_area_ha).toBe(8)
    expect(cycle.status).toBe("planned")
  })

  it("creates a crop cycle linked to an approved assessment", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      assessmentId,
      cropType: "Wheat",
    })
    expect(cycle.assessment_id).toBe(assessmentId)
  })

  it("rejects crop cycle for another user's field", async () => {
    const otherFarmer = createUser({ name: "Other", email: "other@test.com", passwordHash: "hashed_password", role: "farmer" })
    const otherFarm = createFarm({ userId: otherFarmer.id, name: "Other Farm", address: "Other", totalAreaHa: 30 })
    const otherField = createField({ userId: otherFarmer.id, name: "Other Field", areaHa: 5, farmId: otherFarm.id, crop: null, status: null, notes: null })

    await expect(createCropCycleService(farmerId, {
      fieldId: otherField.id,
      cropType: "Rice",
    })).rejects.toThrow("Unauthorized")
  })

  it("rejects assessment from a different field", async () => {
    const otherField = createField({ userId: farmerId, name: "Other Field", areaHa: 5, farmId: farmId, crop: null, status: null, notes: null })
    const otherAssessment = createAssessment({
      userId: farmerId,
      fieldId: otherField.id,
      assessmentType: "soil_testing",
    })

    await expect(createCropCycleService(farmerId, {
      fieldId,
      assessmentId: otherAssessment.id,
      cropType: "Wheat",
    })).rejects.toThrow("does not belong to this field")
  })

  it("rejects cultivated area exceeding field area", async () => {
    await expect(createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
      cultivatedAreaHa: 15, // field is only 10 ha
    })).rejects.toThrow("exceeds field area")
  })

  it("rejects harvest date before planting date", async () => {
    await expect(createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
      plannedPlantingDate: "2025-10-15",
      plannedHarvestDate: "2025-09-01",
    })).rejects.toThrow("cannot be before")
  })

  it("updates a planned crop cycle", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })

    const updated = await updateCropCycleService(farmerId, cycle.id, {
      variety: "PBW 343",
      cultivatedAreaHa: 8,
    })
    expect(updated?.variety).toBe("PBW 343")
    expect(updated?.cultivated_area_ha).toBe(8)
  })

  it("protects closed crop cycles from modification", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    await changeCropCycleStatusService(farmerId, cycle.id, "active")
    await changeCropCycleStatusService(farmerId, cycle.id, "harvesting")
    await changeCropCycleStatusService(farmerId, cycle.id, "harvested")
    await changeCropCycleStatusService(farmerId, cycle.id, "closed")

    await expect(updateCropCycleService(farmerId, cycle.id, {
      cropType: "Rice",
    })).rejects.toThrow("Cannot modify")
  })

  it("validates status transitions", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })

    // planned → active is valid
    const active = await changeCropCycleStatusService(farmerId, cycle.id, "active")
    expect(active?.status).toBe("active")

    // active → harvested is invalid (must go through harvesting)
    await expect(changeCropCycleStatusService(farmerId, cycle.id, "harvested")).rejects.toThrow("Invalid status transition")
  })

  it("rejects deleting active crop cycles", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    await changeCropCycleStatusService(farmerId, cycle.id, "active")

    await expect(deleteCropCycleService(farmerId, cycle.id)).rejects.toThrow("Cannot delete")
  })

  it("allows deleting planned crop cycles", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })

    await expect(deleteCropCycleService(farmerId, cycle.id)).resolves.toBeTruthy()
  })

  it("lists only the user's crop cycles", async () => {
    await createCropCycleService(farmerId, { fieldId, cropType: "Wheat" })

    const otherFarmer = createUser({ name: "Other2", email: "other2@test.com", passwordHash: "hashed_password", role: "farmer" })
    const otherFarm = createFarm({ userId: otherFarmer.id, name: "Other Farm", address: "Other", totalAreaHa: 30 })
    const otherField = createField({ userId: otherFarmer.id, name: "Other Field", areaHa: 5, farmId: otherFarm.id, crop: null, status: null, notes: null })
    await createCropCycleService(otherFarmer.id, { fieldId: otherField.id, cropType: "Rice" })

    const cycles = listCropCyclesService(farmerId)
    expect(cycles).toHaveLength(1)
    expect(cycles[0].crop_type).toBe("Wheat")
  })
})

describe("Crop plan service", () => {
  it("creates a crop plan for a cycle", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })

    const plan = await createCropPlanService(farmerId, {
      cropCycleId: cycle.id,
      plantingMethod: "Seed drill",
      irrigationApproach: "Drip irrigation",
      fieldConditions: "Well-drained loam",
      planningNotes: "Based on soil assessment",
    })
    expect(plan.id).toBeDefined()
    expect(plan.planting_method).toBe("Seed drill")
    expect(plan.status).toBe("draft")
  })

  it("updates a crop plan", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const plan = await createCropPlanService(farmerId, {
      cropCycleId: cycle.id,
      plantingMethod: "Broadcast",
    })

    const updated = await updateCropPlanService(farmerId, plan.id, {
      plantingMethod: "Seed drill",
      status: "approved",
    })
    expect(updated?.planting_method).toBe("Seed drill")
    expect(updated?.status).toBe("approved")
  })

  it("rejects plan creation for another user's cycle", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })

    const otherFarmer = createUser({ name: "Other3", email: "other3@test.com", passwordHash: "hashed_password", role: "farmer" })
    await expect(createCropPlanService(otherFarmer.id, {
      cropCycleId: cycle.id,
    })).rejects.toThrow("Unauthorized")
  })
})

describe("Crop stage service", () => {
  it("creates stages for a crop cycle", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })

    const stage1 = await createCropStageService(farmerId, {
      cropCycleId: cycle.id,
      stageName: "Land preparation",
      plannedStartDate: "2025-10-01",
      plannedEndDate: "2025-10-10",
    })
    expect(stage1.sequence).toBe(0)

    const stage2 = await createCropStageService(farmerId, {
      cropCycleId: cycle.id,
      stageName: "Sowing",
      plannedStartDate: "2025-10-11",
      plannedEndDate: "2025-10-15",
    })
    expect(stage2.sequence).toBe(1)
  })

  it("updates a stage status", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const stage = await createCropStageService(farmerId, {
      cropCycleId: cycle.id,
      stageName: "Land preparation",
    })

    const updated = await updateCropStageService(farmerId, stage.id, {
      status: "in_progress",
      actualStartDate: "2025-10-01",
    })
    expect(updated?.status).toBe("in_progress")
  })

  it("lists stages in sequence order", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    await createCropStageService(farmerId, { cropCycleId: cycle.id, stageName: "Sowing" })
    await createCropStageService(farmerId, { cropCycleId: cycle.id, stageName: "Land preparation" })

    const stages = listStagesByCycleService(farmerId, cycle.id)
    expect(stages).toHaveLength(2)
    expect(stages[0].sequence).toBe(0)
    expect(stages[1].sequence).toBe(1)
  })

  it("deletes a stage", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const stage = await createCropStageService(farmerId, {
      cropCycleId: cycle.id,
      stageName: "Land preparation",
    })

    await expect(deleteCropStageService(farmerId, stage.id)).resolves.toBeTruthy()
    const stages = listStagesByCycleService(farmerId, cycle.id)
    expect(stages).toHaveLength(0)
  })
})

describe("Input requirement service", () => {
  it("creates an input requirement", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
      cultivatedAreaHa: 8,
    })

    const req = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      productName: "DAP",
      plannedQuantity: 200,
      unit: "kg",
      estimatedUnitPrice: 15,
      intendedPurpose: "Basal application",
    })
    expect(req.id).toBeDefined()
    expect(req.input_category).toBe("Fertilizer")
    expect(req.planned_quantity).toBe(200)
    expect(req.estimated_total_cost).toBe(3000) // 200 * 15
  })

  it("calculates quantity from rate per ha", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
      cultivatedAreaHa: 8,
    })

    const req = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Seed",
      productName: "Wheat seed",
      ratePerHa: 120,
      unit: "kg",
    })
    expect(req.planned_quantity).toBe(960) // 120 * 8 ha
  })

  it("recalculates estimated cost on update", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const req = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      plannedQuantity: 100,
      unit: "kg",
      estimatedUnitPrice: 10,
    })

    const updated = await updateInputRequirementService(farmerId, req.id, {
      plannedQuantity: 200,
      estimatedUnitPrice: 15,
    })
    expect(updated?.estimated_total_cost).toBe(3000) // 200 * 15
  })

  it("protects fulfilled requirements from modification", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const req = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      plannedQuantity: 100,
      unit: "kg",
    })
    await updateInputRequirementService(farmerId, req.id, { status: "fulfilled" })

    await expect(updateInputRequirementService(farmerId, req.id, {
      plannedQuantity: 200,
    })).rejects.toThrow("Cannot modify fulfilled")
  })

  it("rejects deleting fulfilled requirements", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const req = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      plannedQuantity: 100,
      unit: "kg",
    })
    await updateInputRequirementService(farmerId, req.id, { status: "fulfilled" })

    await expect(deleteInputRequirementService(farmerId, req.id)).rejects.toThrow("Cannot delete")
  })

  it("allows deleting draft requirements", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    const req = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      plannedQuantity: 100,
      unit: "kg",
    })

    await expect(deleteInputRequirementService(farmerId, req.id)).resolves.toBeTruthy()
  })

  it("lists requirements by crop cycle", async () => {
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      cropType: "Wheat",
    })
    await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      plannedQuantity: 100,
      unit: "kg",
    })
    await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Seed",
      plannedQuantity: 50,
      unit: "kg",
    })

    const requirements = listInputRequirementsByCycleService(farmerId, cycle.id)
    expect(requirements).toHaveLength(2)
  })
})

describe("End-to-end crop planning workflow", () => {
  it("completes the full workflow: cycle → plan → stages → requirements", async () => {
    // 1. Create crop cycle with assessment
    const cycle = await createCropCycleService(farmerId, {
      fieldId,
      assessmentId,
      cropType: "Wheat",
      variety: "PBW 343",
      season: "Rabi 2025",
      cultivatedAreaHa: 8,
      plannedPlantingDate: "2025-10-15",
      plannedHarvestDate: "2026-03-15",
    })
    expect(cycle.assessment_id).toBe(assessmentId)
    expect(cycle.cultivated_area_ha).toBe(8)

    // 2. Activate the cycle
    const active = await changeCropCycleStatusService(farmerId, cycle.id, "active")
    expect(active?.status).toBe("active")

    // 3. Create crop plan
    const plan = await createCropPlanService(farmerId, {
      cropCycleId: cycle.id,
      plantingMethod: "Seed drill",
      irrigationApproach: "Drip irrigation",
    })
    expect(plan.planting_method).toBe("Seed drill")

    // 4. Add stages
    const stage1 = await createCropStageService(farmerId, {
      cropCycleId: cycle.id,
      stageName: "Land preparation",
      plannedStartDate: "2025-10-01",
    })
    const stage2 = await createCropStageService(farmerId, {
      cropCycleId: cycle.id,
      stageName: "Sowing",
      plannedStartDate: "2025-10-11",
    })
    expect(stage1.sequence).toBe(0)
    expect(stage2.sequence).toBe(1)

    // 5. Add input requirements
    const req1 = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Seed",
      productName: "Wheat seed PBW 343",
      ratePerHa: 120,
      unit: "kg",
      estimatedUnitPrice: 40,
    })
    expect(req1.planned_quantity).toBe(960) // 120 * 8 ha
    expect(req1.estimated_total_cost).toBe(38400) // 960 * 40

    const req2 = await createInputRequirementService(farmerId, {
      cropCycleId: cycle.id,
      inputCategory: "Fertilizer",
      productName: "DAP",
      plannedQuantity: 200,
      unit: "kg",
      estimatedUnitPrice: 15,
    })
    expect(req2.estimated_total_cost).toBe(3000)

    // 6. Verify all records are connected
    const cycleDetail = getCropCycleByIdService(farmerId, cycle.id)
    expect(cycleDetail.assessment_id).toBe(assessmentId)

    const planCheck = getCropPlanByCycleService(farmerId, cycle.id)
    expect(planCheck?.crop_cycle_id).toBe(cycle.id)

    const stages = listStagesByCycleService(farmerId, cycle.id)
    expect(stages).toHaveLength(2)

    const requirements = listInputRequirementsByCycleService(farmerId, cycle.id)
    expect(requirements).toHaveLength(2)

    // 7. Verify assessment is unchanged
    const { getAssessmentById } = await import("@/lib/db/assessments")
    const assessment = getAssessmentById(assessmentId)
    expect(assessment?.status).toBe("approved")
  })
})
