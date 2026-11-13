/**
 * Provider earnings page presenter.
 */

import type { BookingRow } from "@/lib/db/types";

export interface EarningsTransactionItem {
  id: number;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  status: string;
}

export interface EarningsPageData {
  stats: {
    earned: number;
    pending: number;
    transactions: number;
  };
  jobs: EarningsTransactionItem[];
}

export function presentEarningsPage(bookings: BookingRow[]): EarningsPageData {
  const jobs = bookings.filter((b) => b.kind === "request");
  const earned = jobs
    .filter((j) => j.status === "confirmed")
    .reduce((s, j) => s + Number(j.amount || 0), 0);

  return {
    stats: {
      earned,
      pending: jobs.filter((j) => j.status === "pending").length,
      transactions: jobs.length,
    },
    jobs: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      counterparty: j.counterparty,
      when_date: j.when_date,
      status: j.status,
    })),
  };
}
