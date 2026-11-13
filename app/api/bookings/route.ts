import { NextResponse } from "next/server";
import { createMachineryRequest, getProviderEquipment } from "@/lib/db";
import { withAuthAndSanitize, badRequest, notFound, conflict } from "@/lib/api";
import { emit } from "@/lib/notify";

/**
 * Farmer booking requests. Creates a linked pair of rows — the farmer's
 * booking and the provider's inbound request — sharing one pair_id so a
 * provider decision stays in sync for both sides.
 */
export const POST = withAuthAndSanitize(
  { role: "farmer", message: "Only farm accounts can request bookings." },
  [
    { name: "equipmentId", type: "integer", required: true, min: 1 },
    { name: "whenDate", type: "text", required: true, maxLength: 20 },
    { name: "endDate", type: "text", maxLength: 20 },
    { name: "note", type: "text", maxLength: 500 },
  ],
  "BOOKING_CREATED",
  (ctx) => ({ equipmentId: ctx.body.equipmentId }),
  async (ctx) => {
    const equipmentId = ctx.body.equipmentId as number;
    const whenDate = ctx.body.whenDate as string;
    const endDate = (ctx.body.endDate as string) || null;
    const note = (ctx.body.note as string) || null;

    if (!whenDate || Number.isNaN(Date.parse(whenDate))) {
      return badRequest("Please choose a valid start date.");
    }
    if (endDate && Date.parse(endDate) < Date.parse(whenDate)) {
      return badRequest("The end date cannot be before the start date.");
    }
    if (Date.parse(whenDate) < Date.now() - 24 * 3600 * 1000) {
      return badRequest("The start date cannot be in the past.");
    }

    const equipment = getProviderEquipment(equipmentId);
    if (!equipment) return notFound("That equipment listing no longer exists.");
    if (equipment.status === "maintenance") {
      return conflict("This equipment is under maintenance and cannot be booked.");
    }

    const amount =
      equipment.daily_rate != null && Number.isFinite(Number(equipment.daily_rate))
        ? Number(equipment.daily_rate)
        : null;

    const requestId = createMachineryRequest({
      farmerUserId: ctx.user.id,
      farmerName: ctx.user.name,
      providerUserId: equipment.owner_user_id,
      providerFarmName: equipment.owner_farm,
      equipmentName: equipment.name,
      whenDate,
      endDate,
      amount,
      note,
    });

    // Emit event — notification rules module notifies the provider
    emit({
      type: "booking.created",
      bookingId: requestId,
      bookingTitle: equipment.name,
      farmerUserId: ctx.user.id,
      providerUserId: equipment.owner_user_id,
    });

    return NextResponse.json({ ok: true, requestId }, { status: 201 });
  },
);
