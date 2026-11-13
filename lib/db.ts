/**
 * lib/db.ts — Barrel re-export file.
 *
 * The monolithic database module has been split into focused entity modules
 * under lib/db/. This file re-exports everything so that existing import
 * paths (`import { listFields } from '@/lib/db'`) continue to work without
 * any caller changes.
 *
 * Each entity module is ~40-100 lines instead of the original 1,000+ lines,
 * making them holdable in AI agent context and independently testable.
 */

/* ---------- Types ---------- */

export type {
  Role, User, SafeUser,
  FieldRow, ActivityRow, BookingRow, DeviceRow, EquipmentRow,
  MemberRow, PurchaseRow, TransactionRow, MaintenanceRow,
  ProviderInfo, CooperativeBooking, HarvestAvailability,
  HarvestRow, NotificationRow, HarvestWithField, HarvestAvailabilityRow,
  EquipmentWithOwner, Booking,
} from "./db/types";

/* ---------- DB connection ---------- */

export { getDb } from "./db/getDb";

/* ---------- Users ---------- */

export {
  toSafeUser, findUserByEmail, getUserById, createUser,
  listAllUsers, updateFarmProfile,
} from "./db/users";

/* ---------- Fields ---------- */

export {
  listFields, getFieldById, createField, updateField, deleteField,
} from "./db/fields";

/* ---------- Activities ---------- */

export {
  listActivities, getActivityById, createActivity, updateActivity, deleteActivity,
} from "./db/activities";

/* ---------- Devices ---------- */

export {
  listDevices, getDeviceById, createDevice, updateDevice, deleteDevice,
} from "./db/devices";

/* ---------- Equipment ---------- */

export {
  listEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment,
  listProviderEquipment, getProviderEquipment,
} from "./db/equipment";

/* ---------- Members ---------- */

export {
  listMembers, getMemberById, createMember, updateMember, deleteMember,
} from "./db/members";

/* ---------- Purchases ---------- */

export {
  listPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase,
} from "./db/purchases";

/* ---------- Transactions ---------- */

export {
  listTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction,
} from "./db/transactions";

/* ---------- Maintenance ---------- */

export {
  listMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance,
} from "./db/maintenance";

/* ---------- Harvests ---------- */

export {
  listHarvests, getHarvestById, createHarvest, updateHarvest, deleteHarvest,
  listHarvestAvailabilityRows,
} from "./db/harvests";

/* ---------- Notifications ---------- */

export {
  listNotifications, countUnreadNotifications, createNotification,
  getNotificationById, markNotificationRead, markAllNotificationsRead,
} from "./db/notifications";

/* ---------- Bookings ---------- */

export {
  listBookings, getBookingById,
  createMachineryRequest, respondToMachineryRequest,
} from "./db/bookings";

/* ---------- Cross-entity queries & data helpers ---------- */

export {
  platformMetrics, addEarlyAccess, addContactMessage,
  listProviders, listCooperativeBookings, listHarvestAvailability,
} from "./db/misc";
