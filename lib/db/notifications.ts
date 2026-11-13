import { getDb } from "./getDb";
import { NotificationRow } from "./types";

export function listNotifications(userId: number): NotificationRow[] {
  return getDb()
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .all(userId) as NotificationRow[];
}

export function countUnreadNotifications(userId: number): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND read = 0")
    .get(userId) as { cnt: number } | undefined;
  return row?.cnt ?? 0;
}

export function createNotification(input: {
  userId: number;
  type: string;
  message: string;
  relatedId?: number | null;
}): NotificationRow {
  const db = getDb();
  const info = db
    .prepare("INSERT INTO notifications (user_id, type, message, related_id) VALUES (?,?,?,?)")
    .run(input.userId, input.type, input.message, input.relatedId ?? null);
  return getNotificationById(Number(info.lastInsertRowid))!;
}

export function getNotificationById(id: number): NotificationRow | undefined {
  return getDb().prepare("SELECT * FROM notifications WHERE id = ?").get(id) as NotificationRow | undefined;
}

export function markNotificationRead(id: number, userId: number): void {
  getDb().prepare("UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?").run(id, userId);
}

export function markAllNotificationsRead(userId: number): void {
  getDb().prepare("UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0").run(userId);
}
