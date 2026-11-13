import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listActivities, createActivity, updateActivity, deleteActivity, getActivityById } from "./activities";

describe("activities module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("listActivities", () => {
    it("returns empty array when no activities exist", () => {
      expect(listActivities(userId)).toEqual([]);
    });

    it("returns activities for the user", () => {
      createActivity({ userId, title: "Plant wheat" });
      createActivity({ userId, title: "Harvest rice" });
      expect(listActivities(userId)).toHaveLength(2);
    });

    it("orders by done then due_date", () => {
      createActivity({ userId, title: "Pending", done: false });
      createActivity({ userId, title: "Done", done: true });
      const activities = listActivities(userId);
      expect(activities[0].title).toBe("Pending");
      expect(activities[1].title).toBe("Done");
    });
  });

  describe("createActivity", () => {
    it("creates an activity with default done=false", () => {
      const activity = createActivity({ userId, title: "Test" });
      expect(activity.id).toBeGreaterThan(0);
      expect(activity.title).toBe("Test");
      expect(activity.done).toBe(0);
    });

    it("creates an activity with done=true", () => {
      const activity = createActivity({ userId, title: "Done", done: true });
      expect(activity.done).toBe(1);
    });

    it("creates with optional fields", () => {
      const activity = createActivity({
        userId,
        title: "Full",
        dueDate: "2025-06-01",
        category: "planting",
      });
      expect(activity.due_date).toBe("2025-06-01");
      expect(activity.category).toBe("planting");
    });
  });

  describe("getActivityById", () => {
    it("returns undefined for non-existent id", () => {
      expect(getActivityById(999)).toBeUndefined();
    });

    it("returns the activity by id", () => {
      const created = createActivity({ userId, title: "Lookup" });
      expect(getActivityById(created.id)!.title).toBe("Lookup");
    });
  });

  describe("updateActivity", () => {
    it("updates title", () => {
      const created = createActivity({ userId, title: "Old" });
      updateActivity(created.id, { title: "New" }, userId);
      expect(getActivityById(created.id)!.title).toBe("New");
    });

    it("marks activity as done", () => {
      const created = createActivity({ userId, title: "Pending", done: false });
      updateActivity(created.id, { done: true }, userId);
      expect(getActivityById(created.id)!.done).toBe(1);
    });

    it("does nothing when no fields provided", () => {
      const created = createActivity({ userId, title: "Unchanged" });
      updateActivity(created.id, {}, userId);
      expect(getActivityById(created.id)!.title).toBe("Unchanged");
    });
  });

  describe("deleteActivity", () => {
    it("deletes an activity", () => {
      const created = createActivity({ userId, title: "To Delete" });
      deleteActivity(created.id, userId);
      expect(getActivityById(created.id)).toBeUndefined();
    });
  });
});
