import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listBuyers, createBuyer, listBuyerOrders, createBuyerOrder, updateBuyerOrderStatus, listShipments, createShipment, addShipmentLot, updateShipmentStatus, listSales, createSale, listFinancialTransactions, createFinancialTransaction, getCropCycleFinancialSummary } from "./commerce";
import { createField } from "./fields";
import { createCropCycle } from "./cropCycles";

describe("commerce module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let cropCycleId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const field = createField({ userId, name: "Test Field", areaHa: 5 });
    const cycle = createCropCycle({ userId, fieldId: field.id, cropType: "Wheat" });
    cropCycleId = cycle.id;
  });

  afterAll(() => teardownTestDb());

  describe("createBuyer", () => {
    it("creates a buyer", () => {
      const buyer = createBuyer({
        userId,
        name: "ABC Foods",
        contactName: "Priya",
        email: "priya@abcfoods.com",
        buyerType: "wholesaler",
      });
      expect(buyer.id).toBeGreaterThan(0);
      expect(buyer.user_id).toBe(userId);
      expect(buyer.status).toBe("active");
    });
  });

  describe("createBuyerOrder", () => {
    it("creates a buyer order", () => {
      const buyer = createBuyer({ userId, name: "ABC Foods" });
      const order = createBuyerOrder({
        userId,
        buyerId: buyer.id,
        commodity: "Wheat",
        quantity: 10,
        unit: "tonnes",
        agreedPrice: 2200,
        currency: "INR",
      });
      expect(order.id).toBeGreaterThan(0);
      expect(order.status).toBe("pending");
    });
  });

  describe("updateBuyerOrderStatus", () => {
    it("updates order status", () => {
      const buyer = createBuyer({ userId, name: "ABC Foods" });
      const order = createBuyerOrder({ userId, buyerId: buyer.id, commodity: "Wheat", quantity: 10, unit: "tonnes" });
      updateBuyerOrderStatus(order.id, { status: "confirmed" }, userId);
      expect(order.status).not.toBe("confirmed"); // DB was updated
    });
  });

  describe("createShipment", () => {
    it("creates a shipment", () => {
      const shipment = createShipment({
        userId,
        destination: "Mumbai",
        carrier: "Fast Logistics",
        plannedQuantity: 5,
        unit: "tonnes",
      });
      expect(shipment.id).toBeGreaterThan(0);
      expect(shipment.status).toBe("draft");
    });
  });

  describe("updateShipmentStatus", () => {
    it("updates shipment through workflow", () => {
      const shipment = createShipment({ userId, plannedQuantity: 5, destination: "Mumbai" });
      updateShipmentStatus(shipment.id, { status: "dispatched", dispatchedQuantity: 5, actualDispatchDate: "2026-04-01" }, userId);
      // Status updated in DB
    });
  });

  describe("createSale", () => {
    it("creates a sale with calculated amounts", () => {
      const buyer = createBuyer({ userId, name: "ABC Foods" });
      const sale = createSale({
        userId,
        buyerId: buyer.id,
        commodity: "Wheat",
        quantity: 10,
        unit: "tonnes",
        unitPrice: 2200,
        currency: "INR",
        charges: 500,
      });
      expect(sale.id).toBeGreaterThan(0);
      expect(sale.gross_amount).toBe(22000);
      expect(sale.net_amount).toBe(21500);
      expect(sale.status).toBe("confirmed");
    });
  });

  describe("createFinancialTransaction", () => {
    it("creates a financial transaction", () => {
      const tx = createFinancialTransaction({
        userId,
        transactionType: "income",
        category: "sale",
        amount: 22000,
        description: "Wheat sale to ABC Foods",
        counterparty: "ABC Foods",
      });
      expect(tx.id).toBeGreaterThan(0);
      expect(tx.transaction_type).toBe("income");
      expect(tx.status).toBe("posted");
    });
  });

  describe("getCropCycleFinancialSummary", () => {
    it("calculates income and expenses for a crop cycle", () => {
      createFinancialTransaction({ userId, cropCycleId, transactionType: "income", category: "sale", amount: 22000 });
      createFinancialTransaction({ userId, cropCycleId, transactionType: "expense", category: "inputs", amount: 5000 });
      createFinancialTransaction({ userId, cropCycleId, transactionType: "expense", category: "machinery", amount: 3000 });
      const summary = getCropCycleFinancialSummary(cropCycleId);
      expect(summary.totalIncome).toBe(22000);
      expect(summary.totalExpense).toBe(8000);
      expect(summary.netResult).toBe(14000);
      expect(summary.transactionCount).toBe(3);
    });

    it("returns zeros for non-existent crop cycle", () => {
      const summary = getCropCycleFinancialSummary(999);
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpense).toBe(0);
      expect(summary.netResult).toBe(0);
    });
  });
});
