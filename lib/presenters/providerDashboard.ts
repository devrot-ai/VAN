/**
 * Provider dashboard presenter.
 */

import type { EquipmentRow, BookingRow } from "@/lib/db/types";

export interface EquipmentListItem {
  id: number;
  name: string;
  category: string | null;
  location: string | null;
  status: string;
}

export interface RequestListItem {
  id: number;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  status: string;
}

export interface ProviderDashboardData {
  stats: {
    equipmentCount: number;
    availableCount: number;
    pendingRequests: number;
    confirmedJobs: number;
  };
  equipment: EquipmentListItem[];
  requests: RequestListItem[];
}

export function presentProviderDashboard(
  equipment: EquipmentRow[],
  bookings: BookingRow[],
): ProviderDashboardData {
  const requests = bookings.filter((b) => b.kind === "request");
  const available = equipment.filter((e) => e.status === "available").length;

  return {
    stats: {
      equipmentCount: equipment.length,
      availableCount: available,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      confirmedJobs: requests.filter((r) => r.status === "confirmed").length,
    },
    equipment: equipment.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      location: e.location,
      status: e.status,
    })),
    requests: requests.map((r) => ({
      id: r.id,
      title: r.title,
      counterparty: r.counterparty,
      when_date: r.when_date,
      status: r.status,
    })),
  };
}
