/**
 * Shared database type definitions extracted from the monolithic db.ts.
 * Each entity module imports its row type from here.
 */

export type Role = "farmer" | "provider" | "cooperative" | "buyer" | "operations";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  farm_name: string | null;
  location: string | null;
  verified_at: string | null;
  created_at: string;
};

export type SafeUser = Omit<User, "password_hash">;

export type FieldRow = {
  id: number;
  user_id: number;
  name: string;
  area_ha: number;
  crop: string | null;
  status: string | null;
  notes: string | null;
};

export type ActivityRow = {
  id: number;
  user_id: number;
  title: string;
  due_date: string | null;
  category: string | null;
  done: number;
};

export type BookingRow = {
  id: number;
  user_id: number;
  kind: string;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  end_date: string | null;
  status: string;
  amount: number | null;
  note: string | null;
  pair_id: string | null;
  partner_user_id: number | null;
};

export type DeviceRow = {
  id: number;
  user_id: number;
  name: string;
  kind: string;
  status: string;
  location: string | null;
};

export type EquipmentRow = {
  id: number;
  user_id: number;
  name: string;
  category: string | null;
  status: string;
  daily_rate: number | null;
  location: string | null;
};

export type MemberRow = {
  id: number;
  user_id: number;
  name: string;
  farm: string | null;
  status: string;
  fields_count: number;
};

export type PurchaseRow = {
  id: number;
  user_id: number;
  lot: string;
  buyer: string | null;
  quantity_tonnes: number;
  amount: number;
  status: string;
};

export type TransactionRow = {
  id: number;
  user_id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string | null;
  created_at: string;
};

export type MaintenanceRow = {
  id: number;
  user_id: number;
  equipment_id: number;
  task: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type ProviderInfo = {
  id: number;
  name: string;
  location: string | null;
  farm_name: string | null;
  equipment_count: number;
};

export type CooperativeBooking = {
  booking_id: number;
  member_name: string;
  farm: string | null;
  title: string;
  when_date: string | null;
  status: string;
};

export type HarvestAvailability = {
  field_id: number;
  farm_name: string | null;
  location: string | null;
  crop: string;
  area_ha: number;
  estimated_tonnes: number;
  status: string | null;
};

export type HarvestRow = {
  id: number;
  user_id: number;
  field_id: number;
  crop: string;
  quantity_tonnes: number;
  date: string;
  quality: string | null;
  status: string;
  created_at: string;
};

export type NotificationRow = {
  id: number;
  user_id: number;
  type: string;
  message: string;
  read: number;
  related_id: number | null;
  created_at: string;
};

export type HarvestWithField = HarvestRow & {
  field_name: string | null;
};

export type HarvestAvailabilityRow = {
  harvest_id: number;
  farmer_name: string;
  farm_name: string | null;
  crop: string;
  quantity_tonnes: number;
  date: string;
  quality: string | null;
  status: string;
};

export type EquipmentWithOwner = {
  id: number;
  owner_user_id: number;
  owner_name: string;
  owner_farm: string | null;
  owner_location: string | null;
  name: string;
  category: string | null;
  status: string;
  daily_rate: number | null;
  location: string | null;
};

export type Booking = {
  id: number;
  user_id: number;
  kind: string;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  end_date: string | null;
  status: string;
  amount: number | null;
  note: string | null;
  pair_id: string | null;
  partner_user_id: number | null;
};
