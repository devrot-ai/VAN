import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, deleteWorkOrder, listOperators, createOperator } from "./workOrders";
import { createField } from "./fields";
import { createFarm } from "./farms";

describe("workOrders module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;
  let fieldId: number;
  let farmId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
    const farm = createFarm({ userId, name: "Test Farm", totalAreaHa: 50 });
    farmId = farm.id;
    const field = createField({ userId, name: "North Field", areaHa: 5 });
    fieldId = field.id;
  });

  afterAll(() => teardownTestDb());

  describe("createOperator", () => {
    it("creates an operator", () => {
      const op = createOperator({
        userId,
        name: "Ramesh",
        phone: "+91-9876543210",
        qualifications: "Tractor, Harvester",
      });
      expect(op.id).toBeGreaterThan(0);
      expect(op.user_id).toBe(userId);
      expect(op.availability).toBe("available");
    });
  });

  describe("createWorkOrder", () => {
    it("creates a work order", () => {
      const op = createOperator({ userId, name: "Ramesh" });
      const wo = createWorkOrder({
        userId,
        farmId,
        fieldId,
        operatorId: op.id,
        activityType: "ploughing",
        description: "Prepare field for sowing",
        plannedStartDate: "2025-10-01",
        plannedEndDate: "2025-10-03",
      });
      expect(wo.id).toBeGreaterThan(0);
      expect(wo.user_id).toBe(userId);
      expect(wo.farm_id).toBe(farmId);
      expect(wo.field_id).toBe(fieldId);
      expect(wo.status).toBe("draft");
    });
  });

  describe("updateWorkOrder", () => {
    it("updates status through workflow", () => {
      const wo = createWorkOrder({ userId, activityType: "ploughing" });
      updateWorkOrder(wo.id, { status: "scheduled" }, userId);
      expect(getWorkOrderById(wo.id)!.status).toBe("scheduled");
      updateWorkOrder(wo.id, { status: "in_progress", actualStartDate: "2025-10-01" }, userId);
      expect(getWorkOrderById(wo.id)!.status).toBe("in_progress");
      updateWorkOrder(wo.id, { status: "completed", actualEndDate: "2025-10-03", cost: 5000 }, userId);
      const completed = getWorkOrderById(wo.id)!;
      expect(completed.status).toBe("completed");
      expect(completed.cost).toBe(5000);
    });
  });

  describe("deleteWorkOrder", () => {
    it("deletes a work order", () => {
      const wo = createWorkOrder({ userId, activityType: "ploughing" });
      deleteWorkOrder(wo.id, userId);
      expect(getWorkOrderById(wo.id)).toBeUndefined();
    });
  });

  describe("listWorkOrders", () => {
    it("returns work orders for user", () => {
      createWorkOrder({ userId, activityType: "ploughing" });
      createWorkOrder({ userId, activityType: "sowing" });
      expect(listWorkOrders(userId)).toHaveLength(2);
    });
  });
});
