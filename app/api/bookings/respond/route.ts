import { NextResponse } from "next/server";
import { respondToMachineryRequest, getBookingById } from "@/lib/db";
import { withAuthAndSanitize, badRequest, notFound, forbidden, conflict } from "@/lib/api";
import { emit } from "@/lib/notify";

/** Providers accept or decline inbound hire requests. */
export const POST = withAuthAndSanitize(
  { role: "provider", message: "Only provider accounts can respond to requests." },
  [
    { name: "bookingId", type: "integer", required: true, min: 1 },
    { name: "action", type: "text", required: true, maxLength: 10, enum: ["accept", "decline"] },
  ],
  "BOOKING_RESPONDED",
  (ctx) => ({ bookingId: ctx.body.bookingId, action: ctx.body.action }),
  async (ctx) => {
    const bookingId = ctx.body.bookingId as number;
    const action = ctx.body.action as "accept" | "decline";

    const result = respondToMachineryRequest({ providerUserId: ctx.user.id, bookingId, action });
    if (result === "ok") {
      // Emit event — notification rules module handles creating notifications
      const booking = getBookingById(bookingId);
      if (booking && booking.user_id !== ctx.user.id) {
        emit({
          type: "booking.responded",
          bookingId,
          bookingTitle: booking.title,
          action,
          providerUserId: ctx.user.id,
          farmerUserId: booking.user_id,
        });
      }
      return NextResponse.json({ ok: true, status: action === "accept" ? "confirmed" : "declined" });
    }
    if (result === "not-found") return notFound("That request no longer exists.");
    if (result === "not-owner") return forbidden("That request is not assigned to your account.");
    if (result === "not-pending") return conflict("That request has already been handled.");
    return badRequest("Unknown error.");
  },
);
