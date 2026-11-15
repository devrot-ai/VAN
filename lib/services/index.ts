/**
 * lib/services/ — Business logic layer.
 *
 * Inspired by OpenHands SDK strict separation of concerns.
 * API routes only handle HTTP (auth, parse, sanitize). Services handle
 * the actual business logic: validation, DB calls, events, notifications.
 * Services are pure functions testable without HTTP.
 *
 * This file re-exports all services. Each entity gets its own service module.
 */

export { createFieldService, updateFieldService, deleteFieldService, listFieldsService, listFieldsByFarmService, getFieldByIdService, getFieldDetailService } from "./fields"
export { createActivityService, updateActivityService, deleteActivityService } from "./activities"
export { createDeviceService, updateDeviceService, deleteDeviceService } from "./devices"
export { createEquipmentService, updateEquipmentService, deleteEquipmentService } from "./equipment"
export { createTransactionService, updateTransactionService, deleteTransactionService } from "./transactions"
export { createMaintenanceService, updateMaintenanceService, deleteMaintenanceService } from "./maintenance"
export { createHarvestService, updateHarvestService, deleteHarvestService } from "./harvests"
export { createMemberService, updateMemberService, deleteMemberService } from "./members"
export { createPurchaseService, updatePurchaseService, deletePurchaseService } from "./purchases"
// Agricultural lifecycle services
export { createFarmService, updateFarmService, deleteFarmService, listFarmsService, getFarmByIdService, getFarmWithFieldsService, getFarmOverviewService } from "./farms"
export { createAssessmentService, updateAssessmentService, deleteAssessmentService, listAssessmentsService, listAssessmentsByFieldService, getAssessmentByIdService, addSoilMeasurementService, listSoilMeasurementsService, getAssessmentReportService, approveAssessmentService, submitAssessmentService } from "./assessments"
// Crop planning services
export {
  createCropCycleService, updateCropCycleService, deleteCropCycleService,
  listCropCyclesService, listCropCyclesByFarmService, listCropCyclesByFieldService,
  getCropCycleByIdService, changeCropCycleStageService, changeCropCycleStatusService,
  createCropPlanService, updateCropPlanService, getCropPlanByCycleService,
  createCropStageService, updateCropStageService, deleteCropStageService, listStagesByCycleService,
  createInputRequirementService, updateInputRequirementService, deleteInputRequirementService,
  listInputRequirementsByCycleService, listInputRequirementsService,
} from "./cropCycles"
