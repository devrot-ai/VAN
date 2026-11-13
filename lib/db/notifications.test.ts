import { describe, it, expect, beforeEach } from "vitest";
import { setupTestDb, teardownTestDb, createTestUser, clearTestDb } from "../testDb";
import { listNotifications, createNotification, markNotificationRead, markAllNotificationsRead, countUnreadNotifications } from "./notifications";

describe("notifications module", () => {
  let db: ReturnType<typeof setupTestDb>;
  let userId: number;

  beforeEach(() => {
    db = setupTestDb();
    clearTestDb(db);
    userId = createTestUser(db, "farmer");
  });

  afterAll(() => teardownTestDb());

  describe("listNotifications", () => {
    it("returns empty array when no notifications exist", () => {
      expect(listNotifications(userId)).toEqual([]);
    });

    it("returns notifications for the user", () => {
      createNotification({ userId, type: "booking", message: "Booking accepted" });
      createNotification({ userId, type: "activity", message: "Activity due" });
      expect(listNotifications(userId)).toHaveLength(2);
    });
  });

  describe("createNotification", () => {
    it("creates a notification", () => {
      const n = createNotification({
        userId,
        type: "booking",
        message: "Your booking was accepted",
        relatedId: 5,
      });
      expect(n.id).toBeGreaterThan(0);
      expect(n.type).toBe("booking");
      expect(n.message).toBe("Your booking was accepted");
      expect(n.read).toBe(0);
    });
  });

  describe("markNotificationRead", () => {
    it("marks a single notification as read", () => {
      const created = createNotification({ userId, type: "test", message: "Test" });
      markNotificationRead(created.id, userId);
      const updated = db.prepare("SELECT * FROM notifications WHERE id = ?").get(created.id) as any;
      expect(updated.read).toBe(1);
    });
  });

  describe("markAllNotificationsRead", () => {
    it("marks all notifications as read", () => {
      createNotification({ userId, type: "test", message: "One" });
      createNotification({ userId, type: "test", message: "Two" });
      markAllNotificationsRead(userId);
      const all = db.prepare("SELECT * FROM notifications WHERE user_id = ?").all(userId) as any[];
      expect(all.every((n: any) => n.read === 1)).toBe(true);
    });
  });

  describe("countUnreadNotifications", () => {
    it("returns 0 when no notifications", () => {
      expect(countUnreadNotifications(userId)).toBe(0);
    });

    it("counts only unread", () => {
      createNotification({ userId, type: "test", message: "Unread" });
      const read = createNotification({ userId, type: "test", message: "Read" });
      markNotificationRead(read.id, userId);
      expect(countUnreadNotifications(userId)).toBe(1);
    });
  });
});
