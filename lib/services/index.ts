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

export { createFieldService, updateFieldService, deleteFieldService } from "./fields"
export { createActivityService, updateActivityService, deleteActivityService } from "./activities"
export { createDeviceService, updateDeviceService, deleteDeviceService } from "./devices"
export { createEquipmentService, updateEquipmentService, deleteEquipmentService } from "./equipment"
export { createTransactionService, updateTransactionService, deleteTransactionService } from "./transactions"
export { createMaintenanceService, updateMaintenanceService, deleteMaintenanceService } from "./maintenance"
export { createHarvestService, updateHarvestService, deleteHarvestService } from "./harvests"
export { createMemberService, updateMemberService, deleteMemberService } from "./members"
export { createPurchaseService, updatePurchaseService, deletePurchaseService } from "./purchases"
