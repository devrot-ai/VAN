/**
 * Bookings page presenter (cooperative portal).
 */

import type { CooperativeBooking } from "@/lib/db/types";

export interface CooperativeBookingItem {
  booking_id: number;
  member_name: string;
  farm: string | null;
  title: string;
  when_date: string | null;
  status: string;
}

export interface BookingsPageData {
  bookings: CooperativeBookingItem[];
}

export function presentBookingsPage(bookings: CooperativeBooking[]): BookingsPageData {
  return {
    bookings: bookings.map((b) => ({
      booking_id: b.booking_id,
      member_name: b.member_name,
      farm: b.farm,
      title: b.title,
      when_date: b.when_date,
      status: b.status,
    })),
  };
}
