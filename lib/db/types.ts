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
  farm_id: number | null;
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

// --- Iteration 1: Agricultural lifecycle types ---

export type FarmRow = {
  id: number;
  user_id: number;
  name: string;
  address: string | null;
  total_area_ha: number;
  status: string;
  created_at: string;
};

export type CropCycleRow = {
  id: number;
  user_id: number;
  field_id: number;
  assessment_id: number | null;
  crop_type: string;
  variety: string | null;
  season: string | null;
  cultivated_area_ha: number | null;
  planned_start_date: string | null;
  planned_planting_date: string | null;
  planned_harvest_date: string | null;
  actual_start_date: string | null;
  actual_planting_date: string | null;
  actual_harvest_date: string | null;
  stage: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export type CropPlanRow = {
  id: number;
  crop_cycle_id: number;
  planting_method: string | null;
  irrigation_approach: string | null;
  field_conditions: string | null;
  planning_notes: string | null;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type CropCycleStageRow = {
  id: number;
  crop_cycle_id: number;
  stage_name: string;
  sequence: number;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  status: string;
  description: string | null;
  responsible_person: string | null;
  notes: string | null;
  created_at: string;
};

export type InputRequirementRow = {
  id: number;
  user_id: number;
  farm_id: number | null;
  field_id: number | null;
  crop_cycle_id: number;
  crop_plan_id: number | null;
  input_catalogue_id: number | null;
  input_category: string;
  product_name: string | null;
  planned_quantity: number;
  unit: string;
  rate_per_ha: number | null;
  planned_application_date: string | null;
  intended_purpose: string | null;
  estimated_unit_price: number | null;
  estimated_total_cost: number | null;
  status: string;
  notes: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type AssessmentRow = {
  id: number;
  user_id: number;
  field_id: number;
  assessment_type: string;
  assessor: string | null;
  data_source: string | null;
  status: string;
  assessment_date: string;
  observations: string | null;
  report: string | null;
  created_at: string;
};

export type SoilMeasurementRow = {
  id: number;
  assessment_id: number;
  sample_id: string | null;
  measurement_type: string;
  value: number;
  unit: string;
  method: string | null;
  source: string | null;
  measured_date: string;
  reference_range_min: number | null;
  reference_range_max: number | null;
  validation_status: string;
  created_at: string;
};

export type InputCatalogueRow = {
  id: number;
  name: string;
  category: string;
  manufacturer: string | null;
  sku: string | null;
  unit: string;
  package_size: number | null;
  unit_price: number | null;
  storage_conditions: string | null;
  status: string;
  created_at: string;
};

export type SupplierRow = {
  id: number;
  user_id: number;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  terms: string | null;
  status: string;
  created_at: string;
};

export type ProcurementOrderRow = {
  id: number;
  user_id: number;
  farm_id: number | null;
  crop_cycle_id: number | null;
  supplier_id: number | null;
  status: string;
  estimated_cost: number | null;
  notes: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
};

export type ProcurementOrderItemRow = {
  id: number;
  order_id: number;
  input_id: number;
  quantity: number;
  unit: string;
  unit_price: number | null;
  total_price: number | null;
  received_quantity: number;
  status: string;
  created_at: string;
};

export type InventoryRow = {
  id: number;
  user_id: number;
  input_id: number;
  location: string | null;
  quantity_available: number;
  quantity_reserved: number;
  unit: string;
  updated_at: string;
};

export type InventoryMovementRow = {
  id: number;
  user_id: number;
  inventory_id: number;
  movement_type: string;
  quantity: number;
  unit: string;
  reference_type: string | null;
  reference_id: number | null;
  date: string;
  notes: string | null;
  created_at: string;
};

export type OperatorRow = {
  id: number;
  user_id: number;
  name: string;
  phone: string | null;
  qualifications: string | null;
  machinery_permissions: string | null;
  availability: string;
  created_at: string;
};

export type WorkOrderRow = {
  id: number;
  user_id: number;
  farm_id: number | null;
  field_id: number | null;
  crop_cycle_id: number | null;
  equipment_id: number | null;
  operator_id: number | null;
  activity_type: string;
  description: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  status: string;
  cost: number | null;
  notes: string | null;
  created_at: string;
};

export type HarvestLotRow = {
  id: number;
  user_id: number;
  crop_cycle_id: number;
  field_id: number;
  harvest_id: number | null;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade: string | null;
  moisture_content: number | null;
  location: string | null;
  status: string;
  created_at: string;
};

export type FacilityRow = {
  id: number;
  user_id: number;
  name: string;
  facility_type: string;
  address: string | null;
  capacity: number | null;
  capacity_unit: string | null;
  status: string;
  created_at: string;
};

export type ProcessingRecordRow = {
  id: number;
  user_id: number;
  facility_id: number | null;
  input_lot_id: number | null;
  process_type: string;
  input_quantity: number;
  input_unit: string;
  output_quantity: number;
  output_unit: string;
  loss_quantity: number;
  grade: string | null;
  processing_date: string;
  operator: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type StorageLocationRow = {
  id: number;
  user_id: number;
  facility_id: number | null;
  name: string;
  capacity: number | null;
  capacity_unit: string | null;
  commodity_type: string | null;
  status: string;
  created_at: string;
};

export type StorageMovementRow = {
  id: number;
  user_id: number;
  storage_location_id: number;
  lot_id: number | null;
  movement_type: string;
  quantity: number;
  unit: string;
  reference_type: string | null;
  reference_id: number | null;
  date: string;
  notes: string | null;
  created_at: string;
};

export type BuyerRow = {
  id: number;
  user_id: number;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  buyer_type: string | null;
  payment_terms: string | null;
  status: string;
  created_at: string;
};

export type BuyerOrderRow = {
  id: number;
  user_id: number;
  buyer_id: number;
  commodity: string;
  quantity: number;
  unit: string;
  grade: string | null;
  agreed_price: number | null;
  currency: string;
  delivery_address: string | null;
  expected_date: string | null;
  status: string;
  created_at: string;
};

export type ShipmentRow = {
  id: number;
  user_id: number;
  buyer_order_id: number | null;
  origin_facility_id: number | null;
  destination: string | null;
  carrier: string | null;
  vehicle: string | null;
  driver: string | null;
  planned_quantity: number;
  unit: string;
  dispatched_quantity: number;
  delivered_quantity: number;
  planned_dispatch_date: string | null;
  actual_dispatch_date: string | null;
  actual_delivery_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type ShipmentLotRow = {
  id: number;
  shipment_id: number;
  lot_id: number;
  quantity: number;
  unit: string;
};

export type SaleRow = {
  id: number;
  user_id: number;
  buyer_id: number | null;
  buyer_order_id: number | null;
  shipment_id: number | null;
  commodity: string;
  quantity: number;
  unit: string;
  unit_price: number;
  gross_amount: number;
  currency: string;
  charges: number;
  net_amount: number;
  sale_date: string;
  status: string;
  created_at: string;
};

export type FinancialTransactionRow = {
  id: number;
  user_id: number;
  farm_id: number | null;
  field_id: number | null;
  crop_cycle_id: number | null;
  transaction_type: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  source_type: string | null;
  source_id: number | null;
  counterparty: string | null;
  status: string;
  created_at: string;
};

// --- Sprint 04: Input supply chain types ---

export type SupplierProductRow = {
  id: number;
  supplier_id: number;
  input_id: number;
  supplier_sku: string | null;
  package_size: number | null;
  offered_unit: string;
  unit_price: number | null;
  currency: string;
  min_order_quantity: number | null;
  available_quantity: number | null;
  lead_time_days: number | null;
  offer_valid_until: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type InputSupplyRequestRow = {
  id: number;
  user_id: number;
  farm_id: number;
  crop_cycle_id: number | null;
  delivery_location: string | null;
  requested_date: string | null;
  notes: string | null;
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InputSupplyRequestItemRow = {
  id: number;
  request_id: number;
  input_requirement_id: number | null;
  input_id: number;
  quantity: number;
  unit: string;
  requested_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export type GoodsReceiptRow = {
  id: number;
  user_id: number;
  procurement_order_id: number;
  receipt_date: string;
  receiving_location: string | null;
  delivery_reference: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  inspection_notes: string | null;
  status: string;
  created_at: string;
};

export type GoodsReceiptItemRow = {
  id: number;
  receipt_id: number;
  order_item_id: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  damaged_quantity: number;
  unit: string;
  notes: string | null;
  created_at: string;
};

export type FulfilmentRecordRow = {
  id: number;
  user_id: number;
  request_id: number;
  request_item_id: number | null;
  input_id: number;
  inventory_id: number;
  farm_id: number;
  quantity: number;
  unit: string;
  batch_number: string | null;
  status: string;
  allocated_at: string;
  dispatched_at: string | null;
  delivered_at: string | null;
  delivery_notes: string | null;
  created_at: string;
};
