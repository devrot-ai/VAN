import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listFields, createField, updateField, deleteField, getFieldById } from "./fields";

describe("fields module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("listFields", () => {
    it("returns empty array when no fields exist", () => {
      const fields = listFields(userId);
      expect(fields).toEqual([]);
    });

    it("returns fields for the user", () => {
      createField({ userId, name: "North Field", areaHa: 2.5, crop: "Wheat" });
      createField({ userId, name: "South Field", areaHa: 1.0, crop: "Rice" });

      const fields = listFields(userId);
      expect(fields).toHaveLength(2);
      expect(fields[0].name).toBe("North Field");
      expect(fields[1].name).toBe("South Field");
    });

    it("does not return fields for other users", () => {
      createField({ userId, name: "My Field", areaHa: 1.0 });
      const otherUserId = createTestUser(db, "farmer", "Other", "other@example.com");
      createField({ userId: otherUserId, name: "Other Field", areaHa: 2.0 });

      const fields = listFields(userId);
      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe("My Field");
    });
  });

  describe("createField", () => {
    it("creates a field and returns it with an id", () => {
      const field = createField({
        userId,
        name: "Test Field",
        areaHa: 3.5,
        crop: "Corn",
        status: "planted",
        notes: "Test notes",
      });

      expect(field.id).toBeGreaterThan(0);
      expect(field.user_id).toBe(userId);
      expect(field.name).toBe("Test Field");
      expect(field.area_ha).toBe(3.5);
      expect(field.crop).toBe("Corn");
      expect(field.status).toBe("planted");
      expect(field.notes).toBe("Test notes");
    });

    it("creates a field with null optional fields", () => {
      const field = createField({
        userId,
        name: "Minimal Field",
        areaHa: 1.0,
      });

      expect(field.crop).toBeNull();
      expect(field.status).toBeNull();
      expect(field.notes).toBeNull();
    });
  });

  describe("getFieldById", () => {
    it("returns undefined for non-existent id", () => {
      const field = getFieldById(999);
      expect(field).toBeUndefined();
    });

    it("returns the field by id", () => {
      const created = createField({ userId, name: "Lookup Field", areaHa: 2.0 });
      const field = getFieldById(created.id);

      expect(field).toBeDefined();
      expect(field!.name).toBe("Lookup Field");
    });
  });

  describe("updateField", () => {
    it("updates a field's name", () => {
      const created = createField({ userId, name: "Old Name", areaHa: 1.0 });
      updateField(created.id, { name: "New Name" }, userId);

      const field = getFieldById(created.id);
      expect(field!.name).toBe("New Name");
    });

    it("updates multiple fields at once", () => {
      const created = createField({ userId, name: "Old", areaHa: 1.0 });
      updateField(
        created.id,
        { name: "Updated", areaHa: 2.5, crop: "Wheat", status: "growing" },
        userId,
      );

      const field = getFieldById(created.id);
      expect(field!.name).toBe("Updated");
      expect(field!.area_ha).toBe(2.5);
      expect(field!.crop).toBe("Wheat");
      expect(field!.status).toBe("growing");
    });

    it("does nothing when no fields provided", () => {
      const created = createField({ userId, name: "Unchanged", areaHa: 1.0 });
      updateField(created.id, {}, userId);

      const field = getFieldById(created.id);
      expect(field!.name).toBe("Unchanged");
    });
  });

  describe("deleteField", () => {
    it("deletes a field", () => {
      const created = createField({ userId, name: "To Delete", areaHa: 1.0 });
      deleteField(created.id, userId);

      const field = getFieldById(created.id);
      expect(field).toBeUndefined();
    });

    it("removes field from list", () => {
      createField({ userId, name: "Keep", areaHa: 1.0 });
      const toDelete = createField({ userId, name: "Delete", areaHa: 2.0 });
      deleteField(toDelete.id, userId);

      const fields = listFields(userId);
      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe("Keep");
    });
  });
});
