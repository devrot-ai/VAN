/**
 * Audit logging — DB-layer seam.
 *
 * Every mutation in the DB layer auto-logs its audit event via the wrappers
 * below. The HTTP layer (API routes) no longer needs to remember to call
 * audit — the seam is at the DB layer, where the mutation actually happens.
 *
 * For mutations that don't fit the standard CRUD pattern (e.g. bookings with
 * cross-portal pairing), use logAudit() directly.
 */

export type AuditEvent =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "ROLE_DENIED"
  | "RESOURCE_DENIED"
  | "BOOKING_CREATED"
  | "BOOKING_RESPONDED"
  | "FIELD_CREATED"
  | "FIELD_UPDATED"
  | "FIELD_DELETED"
  | "FIELD_REASSIGNED"
  | "ACTIVITY_CREATED"
  | "ACTIVITY_UPDATED"
  | "ACTIVITY_DELETED"
  | "DEVICE_CREATED"
  | "DEVICE_UPDATED"
  | "DEVICE_DELETED"
  | "EQUIPMENT_CREATED"
  | "EQUIPMENT_UPDATED"
  | "EQUIPMENT_DELETED"
  | "MEMBER_CREATED"
  | "MEMBER_UPDATED"
  | "MEMBER_DELETED"
  | "PURCHASE_CREATED"
  | "PURCHASE_UPDATED"
  | "PURCHASE_DELETED"
  | "TRANSACTION_CREATED"
  | "TRANSACTION_UPDATED"
  | "TRANSACTION_DELETED"
  | "MAINTENANCE_CREATED"
  | "MAINTENANCE_UPDATED"
  | "MAINTENANCE_DELETED"
  | "HARVEST_CREATED"
  | "HARVEST_UPDATED"
  | "HARVEST_DELETED"
  | "NOTIFICATION_CREATED"
  | "NOTIFICATION_READ"
  | "PURCHASE_STATUS_CHANGED"
  | "PROFILE_UPDATED"
  | "USER_ROLE_CHANGED"
  // Iteration 1: Agricultural lifecycle events
  | "FARM_CREATED"
  | "FARM_UPDATED"
  | "FARM_DELETED"
  | "CROP_CYCLE_CREATED"
  | "CROP_CYCLE_UPDATED"
  | "CROP_CYCLE_DELETED"
  | "ASSESSMENT_CREATED"
  | "ASSESSMENT_UPDATED"
  | "ASSESSMENT_DELETED"
  | "ASSESSMENT_APPROVED"
  | "SOIL_MEASUREMENT_ADDED"
  | "INPUT_CREATED"
  | "SUPPLIER_CREATED"
  | "PROCUREMENT_ORDER_CREATED"
  | "PROCUREMENT_ITEM_ADDED"
  | "PROCUREMENT_ORDER_STATUS_UPDATED"
  | "INVENTORY_MOVEMENT"
  | "OPERATOR_CREATED"
  | "WORK_ORDER_CREATED"
  | "WORK_ORDER_UPDATED"
  | "WORK_ORDER_DELETED"
  | "HARVEST_LOT_CREATED"
  | "HARVEST_LOT_STATUS_UPDATED"
  | "FACILITY_CREATED"
  | "PROCESSING_RECORD_CREATED"
  | "STORAGE_LOCATION_CREATED"
  | "STORAGE_MOVEMENT"
  | "BUYER_CREATED"
  | "BUYER_ORDER_CREATED"
  | "BUYER_ORDER_STATUS_UPDATED"
  | "SHIPMENT_CREATED"
  | "SHIPMENT_LOT_ADDED"
  | "SHIPMENT_STATUS_UPDATED"
  | "SALE_CREATED"
  | "FINANCIAL_TRANSACTION_CREATED"
  // Sprint 03: Crop planning events
  | "CROP_PLAN_CREATED"
  | "CROP_PLAN_UPDATED"
  | "CROP_STAGE_CREATED"
  | "CROP_STAGE_UPDATED"
  | "CROP_STAGE_DELETED"
  | "INPUT_REQUIREMENT_CREATED"
  | "INPUT_REQUIREMENT_UPDATED"
  | "INPUT_REQUIREMENT_DELETED"
  // Sprint 04: Input supply chain events
  | "INPUT_CATALOGUE_CREATED"
  | "INPUT_CATALOGUE_UPDATED"
  | "SUPPLIER_UPDATED"
  | "SUPPLIER_PRODUCT_CREATED"
  | "SUPPLIER_PRODUCT_UPDATED"
  | "INPUT_SUPPLY_REQUEST_CREATED"
  | "INPUT_SUPPLY_REQUEST_SUBMITTED"
  | "INPUT_SUPPLY_REQUEST_REVIEWED"
  | "INPUT_SUPPLY_REQUEST_ITEM_CREATED"
  | "GOODS_RECEIPT_CREATED"
  | "GOODS_RECEIPT_ITEM_CREATED"
  | "FULFILMENT_ALLOCATED"
  | "FULFILMENT_DISPATCHED"
  | "FULFILMENT_DELIVERED"
  | "INVENTORY_TRANSFERRED"
  | "INVENTORY_ADJUSTED"
  | "INVENTORY_RESERVED"
  | "INVENTORY_UNRESERVED";

/**
 * Log an audit event. In development, writes to console.
 * In production, will write to a DB audit_log table.
 */
export function logAudit(event: AuditEvent, userId: number, details?: Record<string, any>) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    ...details,
  };
  console.log("[AUDIT]", JSON.stringify(entry));
}

// ---------------------------------------------------------------------------
// Audit wrappers — concentrate audit logic at the DB layer.
// Each entity module wraps its mutations with these so the HTTP layer never
// needs to think about audit logging.
// ---------------------------------------------------------------------------

/**
 * Wrap a create function that returns the created row (with .id).
 * The wrapper logs the audit event after the inner function succeeds.
 *
 * Usage in entity modules:
 *   export const createField = withAuditCreate("FIELD_CREATED", (input) => {
 *     // ... DB insert ...
 *     return row;
 *   }, (input) => input.userId, (row) => ({ fieldId: row.id }));
 */
export function withAuditCreate<TInput, TRow extends { id: number }>(
  event: AuditEvent,
  fn: (input: TInput) => TRow,
  userIdFn: (input: TInput) => number,
  metaFn?: (row: TRow) => Record<string, unknown>,
) {
  return (input: TInput): TRow => {
    const row = fn(input);
    logAudit(event, userIdFn(input), metaFn ? metaFn(row) : { id: row.id });
    return row;
  };
}

/**
 * Wrap an update function that returns void.
 *
 * Usage in entity modules:
 *   export const updateField = withAuditUpdate("FIELD_UPDATED", (id, input, userId) => {
 *     // ... DB update ...
 *   }, (id) => ({ fieldId: id }));
 */
export function withAuditUpdate<TInput>(
  event: AuditEvent,
  fn: (id: number, input: TInput, userId: number) => void,
  metaFn?: (id: number) => Record<string, unknown>,
) {
  return (id: number, input: TInput, userId: number): void => {
    fn(id, input, userId);
    logAudit(event, userId, metaFn ? metaFn(id) : { id });
  };
}

/**
 * Wrap a delete function that returns void.
 *
 * Usage in entity modules:
 *   export const deleteField = withAuditDelete("FIELD_DELETED", (id, userId) => {
 *     // ... DB delete ...
 *   }, (id) => ({ fieldId: id }));
 */
export function withAuditDelete(
  event: AuditEvent,
  fn: (id: number, userId: number) => void,
  metaFn?: (id: number) => Record<string, unknown>,
) {
  return (id: number, userId: number): void => {
    fn(id, userId);
    logAudit(event, userId, metaFn ? metaFn(id) : { id });
  };
}
