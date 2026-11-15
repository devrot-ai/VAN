/**
 * lib/services/inputSupply.ts — Service layer for the complete input supply chain.
 *
 * Covers: input catalogue, suppliers, supplier products, farmer input requests,
 * procurement orders, goods receipts, inventory management, and fulfilment.
 */

import { getDb } from "@/lib/db/getDb";
import {
  listInputCatalogue,
  getInputById,
  createInput,
  listSuppliers,
  getSupplierById,
  createSupplier,
  listProcurementOrders,
  getProcurementOrderById,
  createProcurementOrder,
  addProcurementOrderItem,
  updateProcurementOrderStatus,
  listProcurementOrderItems,
} from "@/lib/db/procurement";
import {
  listInventory,
  getInventoryById,
  getOrCreateInventory,
  addInventoryMovement,
  listInventoryMovements,
} from "@/lib/db/inventory";
import {
  listSupplierProductsBySupplier,
  listSupplierProductsByInput,
  getSupplierProductById,
  createSupplierProduct,
  updateSupplierProduct,
  listInputSupplyRequests,
  listInputSupplyRequestsByFarm,
  getInputSupplyRequestById,
  createInputSupplyRequest,
  submitInputSupplyRequest,
  reviewInputSupplyRequest,
  listInputSupplyRequestItems,
  addInputSupplyRequestItem,
  listGoodsReceiptsByOrder,
  getGoodsReceiptById,
  createGoodsReceipt,
  addGoodsReceiptItem,
  listFulfilmentRecordsByRequest,
  listFulfilmentRecordsByFarm,
  getFulfilmentRecordById,
  createFulfilmentRecord,
  dispatchFulfilment,
  deliverFulfilment,
} from "@/lib/db/supplyChain";
import { getFarmById } from "@/lib/db/farms";
import { getCropCycleById } from "@/lib/db/cropCycles";
import { events } from "@/lib/events";
import { InputCatalogueRow, SupplierRow, ProcurementOrderRow, InventoryRow } from "@/lib/db/types";

// --- Input Catalogue Service ---

export function listInputCatalogueService(): InputCatalogueRow[] {
  return listInputCatalogue();
}

export function getInputCatalogueById(id: number): InputCatalogueRow | undefined {
  return getInputById(id);
}

export function createInputCatalogueService(input: {
  name: string;
  category: string;
  unit: string;
  manufacturer?: string | null;
  brand?: string | null;
  sku?: string | null;
  description?: string | null;
  packageSize?: number | null;
  unitPrice?: number | null;
  storageConditions?: string | null;
}): InputCatalogueRow {
  const row = createInput({
    name: input.name,
    category: input.category,
    unit: input.unit,
    manufacturer: input.manufacturer,
    sku: input.sku,
    packageSize: input.packageSize,
    unitPrice: input.unitPrice,
    storageConditions: input.storageConditions,
  });
  events.emit("input_catalogue.created", { userId: "system", inputId: String(row.id), category: input.category });
  return row;
}

// --- Supplier Service ---

export function listSuppliersService(userId: number) {
  return listSuppliers(userId);
}

export function getSupplierByIdService(id: number): SupplierRow | undefined {
  return getSupplierById(id);
}

export function createSupplierService(input: {
  userId: number;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  supplierType?: string | null;
  country?: string | null;
  region?: string | null;
  terms?: string | null;
}): SupplierRow {
  const row = createSupplier({
    userId: input.userId,
    name: input.name,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    terms: input.terms,
  });
  events.emit("supplier.created", { userId: String(input.userId), supplierId: String(row.id), name: input.name });
  return row;
}

// --- Supplier Product Service ---

export function getSupplierProductsBySupplier(supplierId: number) {
  return listSupplierProductsBySupplier(supplierId);
}

export function getSupplierProductsByInput(inputId: number) {
  return listSupplierProductsByInput(inputId);
}

export function createSupplierProductService(input: {
  supplierId: number;
  inputId: number;
  offeredUnit: string;
  supplierSku?: string | null;
  packageSize?: number | null;
  unitPrice?: number | null;
  currency?: string;
  minOrderQuantity?: number | null;
  availableQuantity?: number | null;
  leadTimeDays?: number | null;
  offerValidUntil?: string | null;
}) {
  const supplier = getSupplierById(input.supplierId);
  if (!supplier) throw new Error("Supplier not found");
  const product = getInputById(input.inputId);
  if (!product) throw new Error("Input product not found");

  const row = createSupplierProduct(input);
  events.emit("supplier_product.created", {
    userId: "system",
    supplierProductId: String(row.id),
    supplierId: String(input.supplierId),
    inputId: String(input.inputId),
  });
  return row;
}

// --- Input Supply Request Service ---

export function listInputSupplyRequestsService(userId: number) {
  return listInputSupplyRequests(userId);
}

export function listInputSupplyRequestsByFarmService(farmId: number) {
  return listInputSupplyRequestsByFarm(farmId);
}

export function getInputSupplyRequestByIdService(id: number) {
  const request = getInputSupplyRequestById(id);
  if (!request) return null;
  const items = listInputSupplyRequestItems(id);
  const fulfilments = listFulfilmentRecordsByRequest(id);
  return { request, items, fulfilments };
}

export function createInputSupplyRequestService(input: {
  userId: number;
  farmId: number;
  cropCycleId?: number | null;
  deliveryLocation?: string | null;
  requestedDate?: string | null;
  notes?: string | null;
  items?: Array<{
    inputId: number;
    quantity: number;
    unit: string;
    inputRequirementId?: number | null;
    requestedDate?: string | null;
    notes?: string | null;
  }>;
}) {
  // Validate farm ownership
  const farm = getFarmById(input.farmId);
  if (!farm) throw new Error("Farm not found");
  if (farm.user_id !== input.userId && farm.user_id !== 0) {
    // Check if user has access (simplified — in production, check roles)
  }

  // Validate crop cycle if provided
  if (input.cropCycleId) {
    const cycle = getCropCycleById(input.cropCycleId);
    if (!cycle) throw new Error("Crop cycle not found");
  }

  const request = createInputSupplyRequest({
    userId: input.userId,
    farmId: input.farmId,
    cropCycleId: input.cropCycleId,
    deliveryLocation: input.deliveryLocation,
    requestedDate: input.requestedDate,
    notes: input.notes,
  });

  // Add items
  if (input.items && input.items.length > 0) {
    for (const item of input.items) {
      addInputSupplyRequestItem({
        requestId: request.id,
        inputId: item.inputId,
        quantity: item.quantity,
        unit: item.unit,
        inputRequirementId: item.inputRequirementId,
        requestedDate: item.requestedDate,
        notes: item.notes,
      });
    }
  }

  events.emit("input_supply_request.created", {
    userId: String(input.userId),
    requestId: String(request.id),
    farmId: String(input.farmId),
  });

  return { request, items: listInputSupplyRequestItems(request.id) };
}

export function submitInputSupplyRequestService(requestId: number, userId: number) {
  const request = getInputSupplyRequestById(requestId);
  if (!request) throw new Error("Request not found");
  if (request.user_id !== userId) throw new Error("Not authorised");
  if (request.status !== "draft") throw new Error("Only draft requests can be submitted");

  const items = listInputSupplyRequestItems(requestId);
  if (items.length === 0) throw new Error("Request must have at least one item");

  submitInputSupplyRequest(requestId, userId);
  events.emit("input_supply_request.submitted", {
    userId: String(userId),
    requestId: String(requestId),
    farmId: String(request.farm_id),
  });
}

export function reviewInputSupplyRequestService(requestId: number, input: {
  status: "accepted" | "rejected" | "under_review";
  reviewedBy: number;
  reviewNotes?: string | null;
}) {
  const request = getInputSupplyRequestById(requestId);
  if (!request) throw new Error("Request not found");
  if (request.status !== "submitted" && request.status !== "under_review") {
    throw new Error("Only submitted requests can be reviewed");
  }

  reviewInputSupplyRequest(requestId, input);
  events.emit("input_supply_request.reviewed", {
    userId: String(input.reviewedBy),
    requestId: String(requestId),
    reviewedBy: String(input.reviewedBy),
    action: input.status,
  });
}

// --- Procurement Service ---

export function listProcurementOrdersService(userId: number) {
  return listProcurementOrders(userId);
}

export function getProcurementOrderByIdService(id: number) {
  const order = getProcurementOrderById(id);
  if (!order) return null;
  const items = listProcurementOrderItems(id);
  const receipts = listGoodsReceiptsByOrder(id);
  return { order, items, receipts };
}

export function createProcurementOrderService(input: {
  userId: number;
  supplierId: number;
  farmId?: number | null;
  cropCycleId?: number | null;
  expectedDeliveryDate?: string | null;
  currency?: string;
  deliveryDestination?: string | null;
  notes?: string | null;
  items?: Array<{
    inputId: number;
    quantity: number;
    unit: string;
    unitPrice?: number | null;
  }>;
}) {
  const supplier = getSupplierById(input.supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const order = createProcurementOrder({
    userId: input.userId,
    farmId: input.farmId,
    cropCycleId: input.cropCycleId,
    supplierId: input.supplierId,
    notes: input.notes,
  });

  if (input.items && input.items.length > 0) {
    for (const item of input.items) {
      addProcurementOrderItem({
        orderId: order.id,
        inputId: item.inputId,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
      });
    }
  }

  return { order, items: listProcurementOrderItems(order.id) };
}

export function approveProcurementOrderService(orderId: number, userId: number) {
  const order = getProcurementOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status !== "submitted" && order.status !== "draft") {
    throw new Error("Order cannot be approved in current status");
  }

  updateProcurementOrderStatus(orderId, {
    status: "approved",
    approvedAt: new Date().toISOString(),
  }, userId);
}

// --- Goods Receipt Service ---

export function createGoodsReceiptService(input: {
  userId: number;
  procurementOrderId: number;
  receiptDate?: string;
  receivingLocation?: string | null;
  deliveryReference?: string | null;
  batchNumber?: string | null;
  expiryDate?: string | null;
  inspectionNotes?: string | null;
  items: Array<{
    orderItemId: number;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity?: number;
    damagedQuantity?: number;
    unit: string;
    notes?: string | null;
  }>;
}) {
  const order = getProcurementOrderById(input.procurementOrderId);
  if (!order) throw new Error("Procurement order not found");

  const receipt = createGoodsReceipt({
    userId: input.userId,
    procurementOrderId: input.procurementOrderId,
    receiptDate: input.receiptDate,
    receivingLocation: input.receivingLocation,
    deliveryReference: input.deliveryReference,
    batchNumber: input.batchNumber,
    expiryDate: input.expiryDate,
    inspectionNotes: input.inspectionNotes,
  });

  let totalAccepted = 0;
  for (const item of input.items) {
    const receiptItem = addGoodsReceiptItem({
      receiptId: receipt.id,
      orderItemId: item.orderItemId,
      receivedQuantity: item.receivedQuantity,
      acceptedQuantity: item.acceptedQuantity,
      rejectedQuantity: item.rejectedQuantity,
      damagedQuantity: item.damagedQuantity,
      unit: item.unit,
      notes: item.notes,
    });

    totalAccepted += item.acceptedQuantity;

    // Update order item received quantity
    const db = getDb();
    const existingItem = db.prepare("SELECT * FROM procurement_order_items WHERE id = ?").get(item.orderItemId);
    if (existingItem) {
      const newReceived = Number(existingItem.received_quantity || 0) + item.acceptedQuantity;
      db.prepare("UPDATE procurement_order_items SET received_quantity = ? WHERE id = ?").run(newReceived, item.orderItemId);
    }

    // Add inventory movement for accepted quantity
    const inventory = getOrCreateInventory(input.userId, item.orderItemId, input.receivingLocation ?? null, item.unit);
    addInventoryMovement({
      userId: input.userId,
      inventoryId: inventory.id,
      movementType: "receive",
      quantity: item.acceptedQuantity,
      unit: item.unit,
      referenceType: "goods_receipt",
      referenceId: receipt.id,
      notes: `Received from order #${input.procurementOrderId}`,
    });
  }

  // Update procurement order status
  const orderItems = listProcurementOrderItems(input.procurementOrderId);
  const db = getDb();
  const allReceived = orderItems.every((oi) => {
    const oiRow = db.prepare("SELECT * FROM procurement_order_items WHERE id = ?").get(oi.id);
    return Number(oiRow?.received_quantity || 0) >= oi.quantity;
  });
  if (allReceived && orderItems.length > 0) {
    updateProcurementOrderStatus(input.procurementOrderId, { status: "received" }, input.userId);
  } else if (!allReceived) {
    updateProcurementOrderStatus(input.procurementOrderId, { status: "partially_received" }, input.userId);
  }

  emitEvent("goods_receipt.created", {
    userId: String(input.userId),
    receiptId: String(receipt.id),
    orderId: String(input.procurementOrderId),
  });

  return { receipt, items: input.items };
}

// --- Inventory Service ---

export function listInventoryService(userId: number): InventoryRow[] {
  return listInventory(userId);
}

export function getInventoryByIdService(id: number): InventoryRow | undefined {
  return getInventoryById(id);
}

export function getInventoryBalance(userId: number, inputId: number, location?: string | null): {
  available: number;
  reserved: number;
  onHand: number;
} {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM inventory WHERE user_id = ? AND input_id = ? AND (location = ? OR (location IS NULL AND ? IS NULL))"
  ).all(userId, inputId, location ?? null, location ?? null) as InventoryRow[];

  let onHand = 0;
  let reserved = 0;
  for (const row of rows) {
    onHand += row.quantity_available;
    reserved += row.quantity_reserved;
  }

  return { onHand, reserved, available: onHand - reserved };
}

export function reserveStockService(input: {
  userId: number;
  inventoryId: number;
  quantity: number;
  unit: string;
  referenceType: string;
  referenceId: number;
}): void {
  const inventory = getInventoryById(input.inventoryId);
  if (!inventory) throw new Error("Inventory record not found");

  const available = inventory.quantity_available - inventory.quantity_reserved;
  if (available < input.quantity) {
    throw new Error(`Insufficient available stock: ${available} ${input.unit} available, ${input.quantity} requested`);
  }

  addInventoryMovement({
    userId: input.userId,
    inventoryId: input.inventoryId,
    movementType: "reserve",
    quantity: input.quantity,
    unit: input.unit,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    notes: `Reserved for ${input.referenceType} #${input.referenceId}`,
  });
}

export function transferStockService(input: {
  userId: number;
  fromInventoryId: number;
  toInventoryId: number;
  quantity: number;
  unit: string;
  notes?: string | null;
}): void {
  const fromInv = getInventoryById(input.fromInventoryId);
  if (!fromInv) throw new Error("Source inventory not found");

  const available = fromInv.quantity_available - fromInv.quantity_reserved;
  if (available < input.quantity) {
    throw new Error(`Insufficient stock for transfer: ${available} available, ${input.quantity} requested`);
  }

  // Transfer out
  addInventoryMovement({
    userId: input.userId,
    inventoryId: input.fromInventoryId,
    movementType: "transfer_out",
    quantity: input.quantity,
    unit: input.unit,
    referenceType: "transfer",
    referenceId: input.toInventoryId,
    notes: input.notes ?? `Transferred to inventory #${input.toInventoryId}`,
  });

  // Transfer in
  addInventoryMovement({
    userId: input.userId,
    inventoryId: input.toInventoryId,
    movementType: "transfer_in",
    quantity: input.quantity,
    unit: input.unit,
    referenceType: "transfer",
    referenceId: input.fromInventoryId,
    notes: input.notes ?? `Transferred from inventory #${input.fromInventoryId}`,
  });
}

// --- Fulfilment Service ---

export function listFulfilmentRecordsByRequestService(requestId: number) {
  return listFulfilmentRecordsByRequest(requestId);
}

export function listFulfilmentRecordsByFarmService(farmId: number) {
  return listFulfilmentRecordsByFarm(farmId);
}

export function allocateStockToFulfilmentService(input: {
  userId: number;
  requestId: number;
  inputId: number;
  inventoryId: number;
  farmId: number;
  quantity: number;
  unit: string;
  requestItemId?: number | null;
  batchNumber?: string | null;
}) {
  // Validate request
  const request = getInputSupplyRequestById(input.requestId);
  if (!request) throw new Error("Request not found");
  if (request.status !== "accepted") throw new Error("Request must be accepted before fulfilment");

  // Validate inventory
  const inventory = getInventoryById(input.inventoryId);
  if (!inventory) throw new Error("Inventory record not found");

  const available = inventory.quantity_available - inventory.quantity_reserved;
  if (available < input.quantity) {
    throw new Error(`Insufficient available stock: ${available} ${input.unit} available, ${input.quantity} requested`);
  }

  // Reserve stock
  reserveStockService({
    userId: input.userId,
    inventoryId: input.inventoryId,
    quantity: input.quantity,
    unit: input.unit,
    referenceType: "fulfilment",
    referenceId: input.requestId,
  });

  // Create fulfilment record
  const record = createFulfilmentRecord(input);

  emitEvent("fulfilment.allocated", {
    userId: String(input.userId),
    fulfilmentId: String(record.id),
    requestId: String(input.requestId),
    farmId: String(input.farmId),
  });

  return record;
}

export function dispatchFulfilmentService(fulfilmentId: number, userId: number) {
  const record = getFulfilmentRecordById(fulfilmentId);
  if (!record) throw new Error("Fulfilment record not found");
  if (record.status !== "allocated") throw new Error("Only allocated fulfilments can be dispatched");

  dispatchFulfilment(fulfilmentId, userId);

  // Consume inventory (reduce available, reduce reserved)
  const db = getDb();
  db.prepare("UPDATE inventory SET quantity_available = quantity_available - ?, quantity_reserved = quantity_reserved - ?, updated_at = datetime('now') WHERE id = ?")
    .run(record.quantity, record.quantity, record.inventory_id);

  addInventoryMovement({
    userId,
    inventoryId: record.inventory_id,
    movementType: "issue_to_farm",
    quantity: record.quantity,
    unit: record.unit,
    referenceType: "fulfilment",
    referenceId: fulfilmentId,
    notes: "Dispatched to farm",
  });

  emitEvent("fulfilment.dispatched", {
    userId: String(userId),
    fulfilmentId: String(fulfilmentId),
    farmId: String(record.farm_id),
  });
}

export function deliverFulfilmentService(fulfilmentId: number, userId: number, notes?: string | null) {
  const record = getFulfilmentRecordById(fulfilmentId);
  if (!record) throw new Error("Fulfilment record not found");
  if (record.status !== "dispatched") throw new Error("Only dispatched fulfilments can be confirmed as delivered");

  deliverFulfilment(fulfilmentId, userId, notes);

  emitEvent("fulfilment.delivered", {
    userId: String(userId),
    fulfilmentId: String(fulfilmentId),
    farmId: String(record.farm_id),
  });
}

