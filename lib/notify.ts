/**
 * Notification rules module — declarative event-driven notifications.
 *
 * Instead of each route manually calling createNotification(), routes emit
 * typed events. The rules module matches events against declared rules and
 * creates notifications automatically.
 *
 * This creates a clean seam: changing notification behavior touches one file
 * (lib/notify.ts), not every mutation route.
 *
 * Usage:
 *   // In a route:
 *   import { emit } from "@/lib/notify";
 *   emit("booking.responded", { bookingId, action, providerUserId, farmerUserId });
 *
 *   // Rules are evaluated automatically — no route needs to know about notifications.
 */

import { createNotification } from "@/lib/db/notifications";
import { events, EVENT_TYPES } from "@/lib/events";

// ---------------------------------------------------------------------------
// Event bus subscribers — auto-registered on import (MercurJS subscriber pattern)
// ---------------------------------------------------------------------------
// The notification rules module subscribes to the event bus. When services
// emit events, the rules are evaluated automatically. No route needs to
// import or call notify.ts — the subscription handles everything.

// ---------------------------------------------------------------------------
// Event types — each event carries the context needed for notification rules
// ---------------------------------------------------------------------------

export interface BookingRespondedEvent {
  type: "booking.responded";
  bookingId: number;
  bookingTitle: string;
  action: "accept" | "decline";
  providerUserId: number;
  farmerUserId: number;
}

export interface ActivityCreatedEvent {
  type: "activity.created";
  activityId: number;
  activityTitle: string;
  userId: number;
  dueDate: string | null;
}

export interface ActivityUpdatedEvent {
  type: "activity.updated";
  activityId: number;
  activityTitle: string;
  userId: number;
  dueDate: string | null;
}

export interface MaintenanceCreatedEvent {
  type: "maintenance.created";
  maintenanceId: number;
  task: string;
  userId: number;
  dueDate: string | null;
}

export interface MaintenanceUpdatedEvent {
  type: "maintenance.updated";
  maintenanceId: number;
  task: string;
  userId: number;
  dueDate: string | null;
  status: string;
}

export interface HarvestCreatedEvent {
  type: "harvest.created";
  harvestId: number;
  crop: string;
  quantityTonnes: number;
  userId: number;
  status: string;
}

export interface HarvestUpdatedEvent {
  type: "harvest.updated";
  harvestId: number;
  crop: string;
  quantityTonnes: number;
  userId: number;
  status: string;
}

export interface BookingCreatedEvent {
  type: "booking.created";
  bookingId: number;
  bookingTitle: string;
  farmerUserId: number;
  providerUserId: number | null;
}

export type NotifyEvent =
  | BookingRespondedEvent
  | ActivityCreatedEvent
  | ActivityUpdatedEvent
  | MaintenanceCreatedEvent
  | MaintenanceUpdatedEvent
  | HarvestCreatedEvent
  | HarvestUpdatedEvent
  | BookingCreatedEvent;

// ---------------------------------------------------------------------------
// Notification rule type
// ---------------------------------------------------------------------------

/**
 * A notification rule declares when a notification fires and what it says.
 * Each rule matches on an event type and returns a notification payload.
 * If the rule returns `null`, no notification is created.
 */
interface Rule {
  /** Event type string this rule matches on */
  eventType: string;
  /** Returns notification payload(s) for this event, or null to skip */
  handler: (event: NotifyEvent) => Array<{
    userId: number;
    type: string;
    message: string;
    relatedId?: number | null;
  }> | null;
}

// ---------------------------------------------------------------------------
// Rules — add or modify notification behavior here, not in routes
// ---------------------------------------------------------------------------

const rules: Rule[] = [
  // --- Booking responses ---
  {
    eventType: "booking.responded",
    handler: (event) => {
      if (event.type !== "booking.responded") return null;
      const statusText = event.action === "accept" ? "accepted" : "declined";
      return [
        {
          userId: event.farmerUserId,
          type: "booking_response",
          message: `Your booking "${event.bookingTitle}" has been ${statusText}.`,
          relatedId: event.bookingId,
        },
      ];
    },
  },

  // --- Booking created — notify the provider ---
  {
    eventType: "booking.created",
    handler: (event) => {
      if (event.type !== "booking.created") return null;
      if (!event.providerUserId) return null;
      return [
        {
          userId: event.providerUserId,
          type: "booking_request",
          message: `New booking request: "${event.bookingTitle}".`,
          relatedId: event.bookingId,
        },
      ];
    },
  },

  // --- Activity created with due date — notify owner ---
  {
    eventType: "activity.created",
    handler: (event) => {
      if (event.type !== "activity.created") return null;
      if (!event.dueDate) return null;
      return [
        {
          userId: event.userId,
          type: "activity_due",
          message: `Activity "${event.activityTitle}" is due on ${event.dueDate}.`,
          relatedId: event.activityId,
        },
      ];
    },
  },

  // --- Maintenance created with due date — notify owner ---
  {
    eventType: "maintenance.created",
    handler: (event) => {
      if (event.type !== "maintenance.created") return null;
      if (!event.dueDate) return null;
      return [
        {
          userId: event.userId,
          type: "maintenance_due",
          message: `Maintenance "${event.task}" is due on ${event.dueDate}.`,
          relatedId: event.maintenanceId,
        },
      ];
    },
  },

  // --- Maintenance completed — notify owner ---
  {
    eventType: "maintenance.updated",
    handler: (event) => {
      if (event.type !== "maintenance.updated") return null;
      if (event.status === "completed") {
        return [
          {
            userId: event.userId,
            type: "maintenance_completed",
            message: `Maintenance "${event.task}" has been marked completed.`,
            relatedId: event.maintenanceId,
          },
        ];
      }
      return null;
    },
  },

  // --- Harvest created with "ready" status — notify owner ---
  {
    eventType: "harvest.created",
    handler: (event) => {
      if (event.type !== "harvest.created") return null;
      if (event.status === "ready") {
        return [
          {
            userId: event.userId,
            type: "harvest_ready",
            message: `${event.quantityTonnes} tonnes of ${event.crop} is ready for market.`,
            relatedId: event.harvestId,
          },
        ];
      }
      return null;
    },
  },

  // --- Harvest updated to "ready" status ---
  {
    eventType: "harvest.updated",
    handler: (event) => {
      if (event.type !== "harvest.updated") return null;
      if (event.status === "ready") {
        return [
          {
            userId: event.userId,
            type: "harvest_ready",
            message: `${event.quantityTonnes} tonnes of ${event.crop} is now ready for market.`,
            relatedId: event.harvestId,
          },
        ];
      }
      return null;
    },
  },
];

// ---------------------------------------------------------------------------
// Public API — routes call emit(), rules handle the rest
// ---------------------------------------------------------------------------

/**
 * Emit a notification event. The rules module evaluates all matching rules
 * and creates notifications automatically.
 *
 * This is the only function routes should call for notifications.
 */
export function emit(event: NotifyEvent): void {
  for (const rule of rules) {
    if (event.type === rule.eventType) {
      const notifications = rule.handler(event);
      if (notifications) {
        for (const n of notifications) {
          createNotification(n);
        }
      }
    }
  }
}

/**
 * Check for time-based notifications (called by scheduled job or on page load).
 * Returns notifications to create for activities and maintenance due soon.
 *
 * This is separate from event-driven notifications because it requires
 * querying the DB for upcoming due dates rather than reacting to mutations.
 */
export interface TimeCheckResult {
  notifications: Array<{
    userId: number;
    type: string;
    message: string;
    relatedId?: number | null;
  }>;
}

/**
 * Check for activities and maintenance items due within the next `hours` hours.
 * Only creates notifications if one doesn't already exist for that item.
 */
export function checkDueSoon(hours: number = 24): TimeCheckResult {
  // This is a placeholder for scheduled checks. In production, this would
  // be called by a cron job or on page load. For now, it returns empty
  // since we don't have a scheduled job runner in Next.js app router.
  // The event-driven rules above handle the immediate notification needs.
  return { notifications: [] };
}

// ---------------------------------------------------------------------------
// Auto-subscribe to event bus — MercurJS subscriber pattern
// ---------------------------------------------------------------------------
// When lib/events emits an event, these handlers bridge the event bus payload
// to the notification rules system. This file is imported by the app layout,
// so subscriptions are active for the lifetime of the server process.

function bridgeToRules(event: NotifyEvent): void {
  for (const rule of rules) {
    if (event.type === rule.eventType) {
      const notifications = rule.handler(event);
      if (notifications) {
        for (const n of notifications) {
          createNotification(n);
        }
      }
    }
  }
}

// Subscribe to all event types that have notification rules
events.subscribe(EVENT_TYPES.BOOKING_RESPONDED, (payload: any) => {
  bridgeToRules({
    type: "booking.responded",
    bookingId: Number(payload.bookingId),
    bookingTitle: "",
    action: payload.action === "accepted" ? "accept" : "decline",
    providerUserId: Number(payload.userId),
    farmerUserId: Number(payload.farmerId) || Number(payload.userId),
  });
});

events.subscribe(EVENT_TYPES.BOOKING_CREATED, (payload: any) => {
  bridgeToRules({
    type: "booking.created",
    bookingId: Number(payload.bookingId),
    bookingTitle: "",
    farmerUserId: Number(payload.farmerId),
    providerUserId: payload.providerId ? Number(payload.providerId) : null,
  });
});

events.subscribe(EVENT_TYPES.ACTIVITY_CREATED, (payload: any) => {
  bridgeToRules({
    type: "activity.created",
    activityId: Number(payload.activityId),
    activityTitle: "",
    userId: Number(payload.userId),
    dueDate: null,
  });
});

events.subscribe(EVENT_TYPES.MAINTENANCE_CREATED, (payload: any) => {
  bridgeToRules({
    type: "maintenance.created",
    maintenanceId: Number(payload.maintenanceId),
    task: "",
    userId: Number(payload.userId),
    dueDate: null,
  });
});

events.subscribe(EVENT_TYPES.MAINTENANCE_UPDATED, (payload: any) => {
  bridgeToRules({
    type: "maintenance.updated",
    maintenanceId: Number(payload.maintenanceId),
    task: "",
    userId: Number(payload.userId),
    dueDate: null,
    status: "",
  });
});

events.subscribe(EVENT_TYPES.HARVEST_CREATED, (payload: any) => {
  bridgeToRules({
    type: "harvest.created",
    harvestId: Number(payload.harvestId),
    crop: "",
    quantityTonnes: 0,
    userId: Number(payload.userId),
    status: "",
  });
});

events.subscribe(EVENT_TYPES.HARVEST_UPDATED, (payload: any) => {
  bridgeToRules({
    type: "harvest.updated",
    harvestId: Number(payload.harvestId),
    crop: "",
    quantityTonnes: 0,
    userId: Number(payload.userId),
    status: "",
  });
});
