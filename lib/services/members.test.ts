import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { createMemberService, updateMemberService, deleteMemberService } from "./members";
import { getMemberById } from "../db/members";

describe("members service", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "cooperative");
  });

  afterEach(() => teardownTestDb());

  it("creates a member through the service", async () => {
    const row = await createMemberService(userId, {
      name: "Green Valley Farm",
      status: "active",
    });
    expect(row.name).toBe("Green Valley Farm");
    expect(row.status).toBe("active");
  });

  it("rejects invalid member data", async () => {
    await expect(
      createMemberService(userId, { name: "", status: "active" }),
    ).rejects.toThrow();
  });

  it("updates a member through the service", async () => {
    const created = await createMemberService(userId, {
      name: "Old Farm",
      status: "active",
    });
    const result = await updateMemberService(userId, created.id, {
      name: "New Farm",
      status: "active",
    });
    expect(result).toBe(true);
    expect(getMemberById(created.id)!.name).toBe("New Farm");
  });

  it("deletes a member through the service", async () => {
    const created = await createMemberService(userId, {
      name: "To Delete",
      status: "active",
    });
    const result = await deleteMemberService(userId, created.id);
    expect(result).toBe(true);
    expect(getMemberById(created.id)).toBeUndefined();
  });
});
