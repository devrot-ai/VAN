/**
 * lib/events.ts — Typed event bus.
 *
 * Inspired by OpenHands SDK event-sourced state model and MercurJS subscriber pattern.
 * All inter-module communication flows through typed events instead of direct function calls.
 * This creates clean seams: modules emit events, other modules subscribe.
 * No module needs to know about another module's existence.
 */

/* ---------- Core Types ---------- */

export type EventHandler<T = any> = (payload: T) => void | Promise<void>

export interface EmittedEvent<T = any> {
  type: string
  payload: T
  timestamp: number
}

/* ---------- Event Definitions ---------- */

// Entity lifecycle events
export interface FieldCreatedEvent { userId: string; fieldId: string }
export interface FieldUpdatedEvent { userId: string; fieldId: string }
export interface FieldDeletedEvent { userId: string; fieldId: string }

export interface ActivityCreatedEvent { userId: string; activityId: string }
export interface ActivityUpdatedEvent { userId: string; activityId: string }
export interface ActivityDeletedEvent { userId: string; activityId: string }

export interface DeviceCreatedEvent { userId: string; deviceId: string }
export interface DeviceUpdatedEvent { userId: string; deviceId: string }
export interface DeviceDeletedEvent { userId: string; deviceId: string }

export interface EquipmentCreatedEvent { userId: string; equipmentId: string }
export interface EquipmentUpdatedEvent { userId: string; equipmentId: string }
export interface EquipmentDeletedEvent { userId: string; equipmentId: string }

export interface MemberCreatedEvent { userId: string; memberId: string }
export interface MemberUpdatedEvent { userId: string; memberId: string }
export interface MemberDeletedEvent { userId: string; memberId: string }

export interface PurchaseCreatedEvent { userId: string; purchaseId: string }
export interface PurchaseUpdatedEvent { userId: string; purchaseId: string }
export interface PurchaseDeletedEvent { userId: string; purchaseId: string }

export interface TransactionCreatedEvent { userId: string; transactionId: string }
export interface TransactionUpdatedEvent { userId: string; transactionId: string }
export interface TransactionDeletedEvent { userId: string; transactionId: string }

export interface MaintenanceCreatedEvent { userId: string; maintenanceId: string }
export interface MaintenanceUpdatedEvent { userId: string; maintenanceId: string }
export interface MaintenanceDeletedEvent { userId: string; maintenanceId: string }

export interface HarvestCreatedEvent { userId: string; harvestId: string }
export interface HarvestUpdatedEvent { userId: string; harvestId: string }
export interface HarvestDeletedEvent { userId: string; harvestId: string }

// Booking events
export interface BookingCreatedEvent {
  userId: string; bookingId: string; farmerId: string; providerId: string; equipmentId: string
}
export interface BookingRespondedEvent {
  userId: string; bookingId: string; action: "accepted" | "declined"
}

// Notification events
export interface NotificationCreatedEvent { notificationId: string; userId: string }

// Profile events
export interface ProfileUpdatedEvent { userId: string }

// Agricultural lifecycle events
export interface FarmCreatedEvent { userId: string; farmId: string }
export interface FarmUpdatedEvent { userId: string; farmId: string }
export interface FarmDeletedEvent { userId: string; farmId: string }
export interface AssessmentCreatedEvent { userId: string; assessmentId: string }
export interface AssessmentUpdatedEvent { userId: string; assessmentId: string; action?: string }
export interface AssessmentDeletedEvent { userId: string; assessmentId: string }
export interface AssessmentApprovedEvent { userId: string; assessmentId: string; action?: string }
export interface SoilMeasurementAddedEvent { userId: string; assessmentId: string; measurementId: string }

// Crop cycle events
export interface CropCycleCreatedEvent { userId: string; cropCycleId: string }
export interface CropCycleUpdatedEvent { userId: string; cropCycleId: string; action?: string }
export interface CropCycleDeletedEvent { userId: string; cropCycleId: string }
export interface CropPlanCreatedEvent { userId: string; cropPlanId: string; cropCycleId: string }
export interface CropPlanUpdatedEvent { userId: string; cropPlanId: string; action?: string }
export interface CropStageCreatedEvent { userId: string; stageId: string; cropCycleId: string }
export interface CropStageUpdatedEvent { userId: string; stageId: string; action?: string }
export interface InputRequirementCreatedEvent { userId: string; requirementId: string; cropCycleId: string }
export interface InputRequirementUpdatedEvent { userId: string; requirementId: string; action?: string }
// Sprint 04: Input supply chain events
export interface InputCatalogueCreatedEvent { userId: string; inputId: string; category: string }
export interface SupplierCreatedEvent { userId: string; supplierId: string; name: string }
export interface SupplierProductCreatedEvent { userId: string; supplierProductId: string; supplierId: string; inputId: string }
export interface InputSupplyRequestCreatedEvent { userId: string; requestId: string; farmId: string }
export interface InputSupplyRequestSubmittedEvent { userId: string; requestId: string; farmId: string }
export interface InputSupplyRequestReviewedEvent { userId: string; requestId: string; reviewedBy: string; action: string }
export interface GoodsReceiptCreatedEvent { userId: string; receiptId: string; orderId: string }
export interface FulfilmentAllocatedEvent { userId: string; fulfilmentId: string; requestId: string; farmId: string }
export interface FulfilmentDispatchedEvent { userId: string; fulfilmentId: string; farmId: string }
export interface FulfilmentDeliveredEvent { userId: string; fulfilmentId: string; farmId: string }
export interface InventoryMovementCreatedEvent { userId: string; movementId: string; type: string }

/* ---------- Event Type Map ---------- */

export const EVENT_TYPES = {
  FIELD_CREATED: "field.created",
  FIELD_UPDATED: "field.updated",
  FIELD_DELETED: "field.deleted",
  ACTIVITY_CREATED: "activity.created",
  ACTIVITY_UPDATED: "activity.updated",
  ACTIVITY_DELETED: "activity.deleted",
  DEVICE_CREATED: "device.created",
  DEVICE_UPDATED: "device.updated",
  DEVICE_DELETED: "device.deleted",
  EQUIPMENT_CREATED: "equipment.created",
  EQUIPMENT_UPDATED: "equipment.updated",
  EQUIPMENT_DELETED: "equipment.deleted",
  MEMBER_CREATED: "member.created",
  MEMBER_UPDATED: "member.updated",
  MEMBER_DELETED: "member.deleted",
  PURCHASE_CREATED: "purchase.created",
  PURCHASE_UPDATED: "purchase.updated",
  PURCHASE_DELETED: "purchase.deleted",
  TRANSACTION_CREATED: "transaction.created",
  TRANSACTION_UPDATED: "transaction.updated",
  TRANSACTION_DELETED: "transaction.deleted",
  MAINTENANCE_CREATED: "maintenance.created",
  MAINTENANCE_UPDATED: "maintenance.updated",
  MAINTENANCE_DELETED: "maintenance.deleted",
  HARVEST_CREATED: "harvest.created",
  HARVEST_UPDATED: "harvest.updated",
  HARVEST_DELETED: "harvest.deleted",
  BOOKING_CREATED: "booking.created",
  BOOKING_RESPONDED: "booking.responded",
  NOTIFICATION_CREATED: "notification.created",
  PROFILE_UPDATED: "profile.updated",
  // Agricultural lifecycle
  FARM_CREATED: "farm.created",
  FARM_UPDATED: "farm.updated",
  FARM_DELETED: "farm.deleted",
  ASSESSMENT_CREATED: "assessment.created",
  ASSESSMENT_UPDATED: "assessment.updated",
  ASSESSMENT_DELETED: "assessment.deleted",
  ASSESSMENT_APPROVED: "assessment.approved",
  SOIL_MEASUREMENT_ADDED: "soil_measurement.added",
  // Crop cycle events
  CROP_CYCLE_CREATED: "crop_cycle.created",
  CROP_CYCLE_UPDATED: "crop_cycle.updated",
  CROP_CYCLE_DELETED: "crop_cycle.deleted",
  CROP_PLAN_CREATED: "crop_plan.created",
  CROP_PLAN_UPDATED: "crop_plan.updated",
  CROP_STAGE_CREATED: "crop_stage.created",
  CROP_STAGE_UPDATED: "crop_stage.updated",
  INPUT_REQUIREMENT_CREATED: "input_requirement.created",
  INPUT_REQUIREMENT_UPDATED: "input_requirement.updated",
  // Sprint 04: Input supply chain
  INPUT_CATALOGUE_CREATED: "input_catalogue.created",
  SUPPLIER_CREATED: "supplier.created",
  SUPPLIER_PRODUCT_CREATED: "supplier_product.created",
  INPUT_SUPPLY_REQUEST_CREATED: "input_supply_request.created",
  INPUT_SUPPLY_REQUEST_SUBMITTED: "input_supply_request.submitted",
  INPUT_SUPPLY_REQUEST_REVIEWED: "input_supply_request.reviewed",
  GOODS_RECEIPT_CREATED: "goods_receipt.created",
  FULFILMENT_ALLOCATED: "fulfilment.allocated",
  FULFILMENT_DISPATCHED: "fulfilment.dispatched",
  FULFILMENT_DELIVERED: "fulfilment.delivered",
  INVENTORY_MOVEMENT_CREATED: "inventory_movement.created",
} as const

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]

export interface EventPayloadMap {
  "field.created": FieldCreatedEvent
  "field.updated": FieldUpdatedEvent
  "field.deleted": FieldDeletedEvent
  "activity.created": ActivityCreatedEvent
  "activity.updated": ActivityUpdatedEvent
  "activity.deleted": ActivityDeletedEvent
  "device.created": DeviceCreatedEvent
  "device.updated": DeviceUpdatedEvent
  "device.deleted": DeviceDeletedEvent
  "equipment.created": EquipmentCreatedEvent
  "equipment.updated": EquipmentUpdatedEvent
  "equipment.deleted": EquipmentDeletedEvent
  "member.created": MemberCreatedEvent
  "member.updated": MemberUpdatedEvent
  "member.deleted": MemberDeletedEvent
  "purchase.created": PurchaseCreatedEvent
  "purchase.updated": PurchaseUpdatedEvent
  "purchase.deleted": PurchaseDeletedEvent
  "transaction.created": TransactionCreatedEvent
  "transaction.updated": TransactionUpdatedEvent
  "transaction.deleted": TransactionDeletedEvent
  "maintenance.created": MaintenanceCreatedEvent
  "maintenance.updated": MaintenanceUpdatedEvent
  "maintenance.deleted": MaintenanceDeletedEvent
  "harvest.created": HarvestCreatedEvent
  "harvest.updated": HarvestUpdatedEvent
  "harvest.deleted": HarvestDeletedEvent
  "booking.created": BookingCreatedEvent
  "booking.responded": BookingRespondedEvent
  "notification.created": NotificationCreatedEvent
  "profile.updated": ProfileUpdatedEvent
  // Agricultural lifecycle
  "farm.created": FarmCreatedEvent
  "farm.updated": FarmUpdatedEvent
  "farm.deleted": FarmDeletedEvent
  "assessment.created": AssessmentCreatedEvent
  "assessment.updated": AssessmentUpdatedEvent
  "assessment.deleted": AssessmentDeletedEvent
  "assessment.approved": AssessmentApprovedEvent
  "soil_measurement.added": SoilMeasurementAddedEvent
  // Crop cycle events
  "crop_cycle.created": CropCycleCreatedEvent
  "crop_cycle.updated": CropCycleUpdatedEvent
  "crop_cycle.deleted": CropCycleDeletedEvent
  "crop_plan.created": CropPlanCreatedEvent
  "crop_plan.updated": CropPlanUpdatedEvent
  "crop_stage.created": CropStageCreatedEvent
  "crop_stage.updated": CropStageUpdatedEvent
  "input_requirement.created": InputRequirementCreatedEvent
  "input_requirement.updated": InputRequirementUpdatedEvent
  // Sprint 04: Input supply chain
  "input_catalogue.created": InputCatalogueCreatedEvent
  "supplier.created": SupplierCreatedEvent
  "supplier_product.created": SupplierProductCreatedEvent
  "input_supply_request.created": InputSupplyRequestCreatedEvent
  "input_supply_request.submitted": InputSupplyRequestSubmittedEvent
  "input_supply_request.reviewed": InputSupplyRequestReviewedEvent
  "goods_receipt.created": GoodsReceiptCreatedEvent
  "fulfilment.allocated": FulfilmentAllocatedEvent
  "fulfilment.dispatched": FulfilmentDispatchedEvent
  "fulfilment.delivered": FulfilmentDeliveredEvent
  "inventory_movement.created": InventoryMovementCreatedEvent
}

/* ---------- Event Bus Singleton ---------- */

interface Subscribers {
  [type: string]: EventHandler[]
}

class EventBus {
  private subs: Subscribers = {}

  subscribe<T = any>(type: string, handler: EventHandler<T>) {
    if (!this.subs[type]) this.subs[type] = []
    this.subs[type].push(handler)
    return () => this.unsubscribe(type, handler)
  }

  unsubscribe(type: string, handler: EventHandler) {
    this.subs[type] = (this.subs[type] ?? []).filter((h) => h !== handler)
  }

  async emit<T = any>(type: string, payload: T) {
    const event: EmittedEvent<T> = { type, payload, timestamp: Date.now() }
    const handlers = this.subs[type] ?? []
    // Fire all handlers in parallel; log errors but don't let one fail the others
    await Promise.allSettled(handlers.map((h) => Promise.resolve(h(payload)).catch((err) => console.error(`Event handler error [${type}]:`, err))))
    return event
  }

  clear() {
    this.subs = {}
  }
}

export const events = new EventBus()
