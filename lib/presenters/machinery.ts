/**
 * Machinery marketplace page presenter.
 */

import type { EquipmentWithOwner, BookingRow } from "@/lib/db/types";

export interface MachineryListingItem {
  id: number;
  name: string;
  owner_name: string;
  owner_farm: string | null;
  owner_location: string | null;
  daily_rate: number | null;
  status: string;
}

export interface MachineryBookingItem {
  id: number;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  end_date: string | null;
  status: string;
}

export interface MachineryPageData {
  stats: {
    totalListings: number;
    availableNow: number;
    userBookings: number;
    committed: number;
  };
  listings: MachineryListingItem[];
  bookings: MachineryBookingItem[];
}

export function presentMachineryPage(
  listings: EquipmentWithOwner[],
  allListings: EquipmentWithOwner[],
  bookings: BookingRow[],
): MachineryPageData {
  const machineryBookings = bookings.filter((b) => b.kind === "machinery");
  const committed = machineryBookings.reduce((s, b) => s + Number(b.amount || 0), 0);

  return {
    stats: {
      totalListings: allListings.length,
      availableNow: allListings.filter((l) => l.status === "available").length,
      userBookings: machineryBookings.length,
      committed,
    },
    listings: listings.map((l) => ({
      id: l.id,
      name: l.name,
      owner_name: l.owner_name,
      owner_farm: l.owner_farm,
      owner_location: l.owner_location,
      daily_rate: l.daily_rate,
      status: l.status,
    })),
    bookings: machineryBookings.map((b) => ({
      id: b.id,
      title: b.title,
      counterparty: b.counterparty,
      when_date: b.when_date,
      end_date: b.end_date,
      status: b.status,
    })),
  };
}
