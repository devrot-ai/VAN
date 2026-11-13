import { randomBytes } from "node:crypto";
import { getDb } from "./getDb";
import { BookingRow, Booking } from "./types";

function randomPairId(): string {
  return "req_" + randomBytes(16).toString("hex");
}

export function listBookings(userId: number) {
  return getDb().prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY when_date").all(userId) as BookingRow[];
}

export function getBookingById(id: number): BookingRow | undefined {
  return getDb().prepare("SELECT * FROM bookings WHERE id = ?").get(id) as BookingRow | undefined;
}

export function createMachineryRequest(input: {
  farmerUserId: number;
  farmerName: string;
  providerUserId: number;
  providerFarmName: string | null;
  equipmentName: string;
  whenDate: string;
  endDate: string | null;
  amount: number | null;
  note: string | null;
}): number {
  const db = getDb();
  const pair = randomPairId();
  const common = "INSERT INTO bookings (user_id, kind, title, counterparty, when_date, end_date, status, amount, note, pair_id, partner_user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
  db.prepare(common).run(
    input.farmerUserId,
    "machinery",
    `${input.equipmentName} — hire request`,
    input.providerFarmName ?? "Provider",
    input.whenDate,
    input.endDate,
    "pending",
    input.amount,
    input.note,
    pair,
    input.providerUserId,
  );
  const providerInfo = db.prepare(common).run(
    input.providerUserId,
    "request",
    `${input.equipmentName} — hire request`,
    input.farmerName,
    input.whenDate,
    input.endDate,
    "pending",
    input.amount,
    input.note,
    pair,
    input.farmerUserId,
  );
  return Number(providerInfo.lastInsertRowid);
}

export function respondToMachineryRequest(input: {
  providerUserId: number;
  bookingId: number;
  action: "accept" | "decline";
}): "ok" | "not-found" | "not-pending" | "not-owner" {
  const db = getDb();
  const booking = db
    .prepare("SELECT * FROM bookings WHERE id = ? AND kind = 'request'")
    .get(input.bookingId) as (Booking & { user_id: number }) | undefined;
  if (!booking) return "not-found";
  if (booking.user_id !== input.providerUserId) return "not-owner";
  if (booking.status !== "pending") return "not-pending";
  const newStatus = input.action === "accept" ? "confirmed" : "declined";
  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(newStatus, booking.id);
  if (booking.pair_id) {
    db.prepare("UPDATE bookings SET status = ? WHERE pair_id = ? AND kind = 'machinery'").run(
      newStatus,
      booking.pair_id,
    );
  }
  return "ok";
}
