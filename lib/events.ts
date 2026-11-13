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
