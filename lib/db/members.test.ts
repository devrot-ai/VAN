import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listMembers, createMember, updateMember, deleteMember } from "./members";

describe("members module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "cooperative", "Coop", "coop@example.com");
  });

  afterAll(() => teardownTestDb());

  describe("listMembers", () => {
    it("returns empty array when no members exist", () => {
      expect(listMembers(userId)).toEqual([]);
    });

    it("returns members for the user", () => {
      createMember({ userId, name: "Farm A", status: "active" });
      createMember({ userId, name: "Farm B", status: "inactive" });
      expect(listMembers(userId)).toHaveLength(2);
    });
  });

  describe("createMember", () => {
    it("creates a member", () => {
      const m = createMember({
        userId,
        name: "Test Farm",
        farm: "Green Valley",
        status: "active",
        fieldsCount: 5,
      });
      expect(m.id).toBeGreaterThan(0);
      expect(m.name).toBe("Test Farm");
      expect(m.status).toBe("active");
      expect(m.fields_count).toBe(5);
    });
  });

  describe("updateMember", () => {
    it("updates status", () => {
      const created = createMember({ userId, name: "Test", status: "active" });
      updateMember(created.id, { status: "inactive" }, userId);
      const updated = db.prepare("SELECT * FROM members WHERE id = ?").get(created.id) as any;
      expect(updated.status).toBe("inactive");
    });
  });

  describe("deleteMember", () => {
    it("deletes a member", () => {
      const created = createMember({ userId, name: "Test", status: "active" });
      deleteMember(created.id, userId);
      expect(listMembers(userId)).toHaveLength(0);
    });
  });
});
