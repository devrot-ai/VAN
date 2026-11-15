import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listProcurementOrders, getProcurementOrderById, createProcurementOrder, addProcurementOrderItem, updateProcurementOrderStatus, listProcurementOrderItems, listSuppliers, createSupplier, listInputCatalogue, createInput } from "./procurement";

describe("procurement module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("createInput", () => {
    it("creates an input catalogue entry", () => {
      const input = createInput({
        name: "Urea Fertilizer",
        category: "fertilizer",
        manufacturer: "NFL",
        sku: "UREA-50",
        unit: "kg",
        packageSize: 50,
        unitPrice: 650,
      });
      expect(input.id).toBeGreaterThan(0);
      expect(input.name).toBe("Urea Fertilizer");
      expect(input.status).toBe("active");
    });
  });

  describe("listInputCatalogue", () => {
    it("returns active inputs", () => {
      createInput({ name: "Urea", category: "fertilizer", unit: "kg" });
      createInput({ name: "DAP", category: "fertilizer", unit: "kg" });
      expect(listInputCatalogue()).toHaveLength(2);
    });
  });

  describe("createSupplier", () => {
    it("creates a supplier", () => {
      const supplier = createSupplier({
        userId,
        name: "Agri Supplies Co.",
        contactName: "Raj",
        email: "raj@agri.com",
        phone: "+91-9876543210",
      });
      expect(supplier.id).toBeGreaterThan(0);
      expect(supplier.user_id).toBe(userId);
      expect(supplier.status).toBe("active");
    });
  });

  describe("createProcurementOrder", () => {
    it("creates a procurement order", () => {
      const order = createProcurementOrder({
        userId,
        estimatedCost: 15000,
        notes: "Seasonal fertilizer order",
      });
      expect(order.id).toBeGreaterThan(0);
      expect(order.status).toBe("draft");
      expect(order.estimated_cost).toBe(15000);
    });
  });

  describe("addProcurementOrderItem", () => {
    it("adds an item to an order", () => {
      const input = createInput({ name: "Urea", category: "fertilizer", unit: "kg", unitPrice: 650 });
      const order = createProcurementOrder({ userId });
      const item = addProcurementOrderItem({
        orderId: order.id,
        inputId: input.id,
        quantity: 100,
        unit: "kg",
        unitPrice: 650,
      });
      expect(item.id).toBeGreaterThan(0);
      expect(item.order_id).toBe(order.id);
      expect(item.total_price).toBe(65000);
    });
  });

  describe("updateProcurementOrderStatus", () => {
    it("updates order status through workflow", () => {
      const order = createProcurementOrder({ userId });
      updateProcurementOrderStatus(order.id, { status: "submitted" }, userId);
      expect(getProcurementOrderById(order.id)!.status).toBe("submitted");
      updateProcurementOrderStatus(order.id, { status: "approved", approvedAt: new Date().toISOString() }, userId);
      expect(getProcurementOrderById(order.id)!.status).toBe("approved");
    });
  });

  describe("order items", () => {
    it("lists items for an order", () => {
      const input1 = createInput({ name: "Urea", category: "fertilizer", unit: "kg" });
      const input2 = createInput({ name: "DAP", category: "fertilizer", unit: "kg" });
      const order = createProcurementOrder({ userId });
      addProcurementOrderItem({ orderId: order.id, inputId: input1.id, quantity: 100, unit: "kg" });
      addProcurementOrderItem({ orderId: order.id, inputId: input2.id, quantity: 50, unit: "kg" });
      expect(listProcurementOrderItems(order.id)).toHaveLength(2);
    });
  });
});
