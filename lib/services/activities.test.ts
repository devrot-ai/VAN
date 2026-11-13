import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createActivityService, updateActivityService, deleteActivityService } from "./activities";
import { getActivityById } from "../db/activities";

describe("activities service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterEach(() => teardownTestDb());

  it("creates an activity through the service", async () => {
    const row = await createActivityService(userId, {
      title: "Plant rice",
      category: "planting",
      dueDate: "2025-06-01",
    });
    expect(row.title).toBe("Plant rice");
    expect(row.category).toBe("planting");
  });

  it("rejects invalid activity data", async () => {
    await expect(
      createActivityService(userId, { title: "", category: "planting" }),
    ).rejects.toThrow();
  });

  it("updates an activity through the service", async () => {
    const created = await createActivityService(userId, {
      title: "Old task",
      category: "planting",
    });
    const result = await updateActivityService(userId, created.id, {
      title: "New task",
      category: "planting",
    });
    expect(result).toBe(true);
    expect(getActivityById(created.id)!.title).toBe("New task");
  });

  it("deletes an activity through the service", async () => {
    const created = await createActivityService(userId, {
      title: "To delete",
      category: "planting",
    });
    const result = await deleteActivityService(userId, created.id);
    expect(result).toBe(true);
    expect(getActivityById(created.id)).toBeUndefined();
  });
});
