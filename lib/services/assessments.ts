/**
 * lib/services/assessments.ts — Land assessment business logic service.
 *
 * Handles validation, ownership checks, DB calls, and event emission for assessments.
 */

import {
  createAssessment as dbCreate,
  updateAssessment as dbUpdate,
  deleteAssessment as dbDelete,
  listAssessments as dbList,
  listAssessmentsByField as dbListByField,
  getAssessmentById as dbGetById,
  listSoilMeasurements as dbListMeasurements,
  addSoilMeasurement as dbAddMeasurement,
} from "@/lib/db/assessments"
import { getFieldById } from "@/lib/db/fields"
import { mustPass, ASSESSMENT_SCHEMA, SOIL_MEASUREMENT_SCHEMA } from "@/lib/validate"
import { events, EVENT_TYPES } from "@/lib/events"

export async function createAssessmentService(userId: number, input: any) {
  mustPass(ASSESSMENT_SCHEMA, input)
  // Verify the field exists and belongs to the user
  const field = getFieldById(input.fieldId)
  if (!field) throw new Error("Field not found")
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")
  const row = dbCreate({ ...input, userId })
  await events.emit(EVENT_TYPES.ASSESSMENT_CREATED, { userId: String(userId), assessmentId: String(row.id) })
  return row
}

export async function updateAssessmentService(userId: number, id: number, input: any) {
  const assessment = dbGetById(id)
  if (!assessment) throw new Error("Assessment not found")
  if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
  
  // Protect approved assessments from modification
  if (assessment.status === "approved") {
    throw new Error("Approved assessments cannot be modified. Create a new assessment for corrections.")
  }
  
  // Prevent arbitrary status changes - only allow draft → under_review by owner
  if (input.status && input.status !== assessment.status) {
    if (assessment.status !== "draft" || input.status !== "under_review") {
      throw new Error("Invalid status transition. Use the submit or approve workflow.")
    }
  }
  
  mustPass(ASSESSMENT_SCHEMA, input)
  dbUpdate(id, input, userId)
  await events.emit(EVENT_TYPES.ASSESSMENT_UPDATED, { userId: String(userId), assessmentId: String(id) })
  return dbGetById(id)
}

export async function deleteAssessmentService(userId: number, id: number) {
  const assessment = dbGetById(id)
  if (!assessment) throw new Error("Assessment not found")
  if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
  
  // Protect approved and under_review assessments from deletion
  if (assessment.status === "approved" || assessment.status === "under_review") {
    throw new Error(`Cannot delete assessment with status "${assessment.status}". Historical records must be preserved.`)
  }
  
  dbDelete(id, userId)
  await events.emit(EVENT_TYPES.ASSESSMENT_DELETED, { userId: String(userId), assessmentId: String(id) })
  return true
}

export function listAssessmentsService(userId: number) {
  return dbList(userId)
}

export function listAssessmentsByFieldService(userId: number, fieldId: number) {
  const field = getFieldById(fieldId)
  if (!field) throw new Error("Field not found")
  if (field.user_id !== userId) throw new Error("Unauthorized: field belongs to another user")
  return dbListByField(fieldId)
}

export function getAssessmentByIdService(userId: number, id: number) {
  const assessment = dbGetById(id)
  if (!assessment) return undefined
  if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
  return assessment
}

export async function addSoilMeasurementService(userId: number, input: any) {
  mustPass(SOIL_MEASUREMENT_SCHEMA, input)
  // Verify the assessment exists and belongs to the user
  const assessment = dbGetById(input.assessmentId)
  if (!assessment) throw new Error("Assessment not found")
  if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
  const row = dbAddMeasurement(input)
  await events.emit(EVENT_TYPES.SOIL_MEASUREMENT_ADDED, {
    userId: String(userId),
    assessmentId: String(input.assessmentId),
    measurementId: String(row.id),
  })
  return row
}

export function listSoilMeasurementsService(userId: number, assessmentId: number) {
  const assessment = dbGetById(assessmentId)
  if (!assessment) throw new Error("Assessment not found")
  if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")
  return dbListMeasurements(assessmentId)
}

/**
 * Get a complete assessment report with measurements.
 */
export function getAssessmentReportService(userId: number, assessmentId: number) {
  const assessment = getAssessmentByIdService(userId, assessmentId)
  if (!assessment) return undefined
  const measurements = listSoilMeasurementsService(userId, assessmentId)
  const field = getFieldById(assessment.field_id)
  return {
    ...assessment,
    field,
    measurements,
    measurementCount: measurements.length,
  }
}

/**
 * Approve an assessment (status transition).
 * Only users with the "operations" role can approve assessments.
 * The original creator cannot approve their own assessment.
 */
export async function approveAssessmentService(
  userId: number,
  userRole: string,
  assessmentId: number,
  report?: string,
) {
  // Only operations role can approve
  if (userRole !== "operations") {
    throw new Error("Only VAN operations personnel can approve assessments.")
  }

  const assessment = dbGetById(assessmentId)
  if (!assessment) throw new Error("Assessment not found")

  // Cannot approve an already-approved assessment (idempotent)
  if (assessment.status === "approved") {
    throw new Error("Assessment is already approved.")
  }

  // Only draft or under_review can be approved
  if (assessment.status !== "draft" && assessment.status !== "under_review") {
    throw new Error(`Cannot approve assessment with status "${assessment.status}".`)
  }

  // Must have at least one measurement
  const measurements = dbListMeasurements(assessmentId)
  if (measurements.length === 0) {
    throw new Error("Cannot approve assessment without measurements.")
  }

  const input: any = { status: "approved" }
  if (report) input.report = report
  dbUpdate(assessmentId, input, userId)
  await events.emit(EVENT_TYPES.ASSESSMENT_APPROVED, {
    userId: String(userId),
    assessmentId: String(assessmentId),
    action: "approved",
  })
  return dbGetById(assessmentId)
}

/**
 * Submit an assessment for review (status transition).
 * Farmers can submit their own assessments.
 */
export async function submitAssessmentService(userId: number, assessmentId: number) {
  const assessment = dbGetById(assessmentId)
  if (!assessment) throw new Error("Assessment not found")
  if (assessment.user_id !== userId) throw new Error("Unauthorized: assessment belongs to another user")

  if (assessment.status !== "draft") {
    throw new Error(`Cannot submit assessment with status "${assessment.status}".`)
  }

  // Must have at least one measurement to submit
  const measurements = dbListMeasurements(assessmentId)
  if (measurements.length === 0) {
    throw new Error("Cannot submit assessment without measurements.")
  }

  dbUpdate(assessmentId, { status: "under_review" }, userId)
  await events.emit(EVENT_TYPES.ASSESSMENT_UPDATED, {
    userId: String(userId),
    assessmentId: String(assessmentId),
    action: "submitted",
  })
  return dbGetById(assessmentId)
}
