import { NextResponse } from "next/server";
import {
  listNotifications,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/db";
import { withAuth, withAuthAndSanitize, badRequest } from "@/lib/api";

/** List notifications and unread count for the signed-in user. */
export const GET = withAuth({}, async (ctx) => {
  const notifications = listNotifications(ctx.user.id);
  const unreadCount = countUnreadNotifications(ctx.user.id);
  return NextResponse.json({ ok: true, notifications, unreadCount });
});

/** Mark a notification as read, or mark all as read. */
export const POST = withAuthAndSanitize(
  {},
  [
    { name: "id", type: "integer", min: 1 },
    { name: "all", type: "text", maxLength: 5 },
  ],
  "NOTIFICATION_READ",
  () => ({}),
  async (ctx) => {
    const all = ctx.body.all;
    if (all) {
      markAllNotificationsRead(ctx.user.id);
      return NextResponse.json({ ok: true });
    }

    const id = ctx.body.id;
    if (id !== undefined && id !== null) {
      markNotificationRead(Number(id), ctx.user.id);
      return NextResponse.json({ ok: true });
    }

    return badRequest("Specify 'id' to mark one notification read or 'all' to mark all read.");
  },
);
