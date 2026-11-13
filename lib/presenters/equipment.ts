/**
 * Equipment page presenter (provider portal).
 */

import type { EquipmentRow } from "@/lib/db/types";

export interface ProviderEquipmentItem {
  id: number;
  name: string;
  category: string | null;
  status: string;
  daily_rate: number | null;
  location: string | null;
}

export interface EquipmentPageData {
  stats: {
    total: number;
    available: number;
    booked: number;
  };
  equipment: ProviderEquipmentItem[];
}

export function presentEquipmentPage(equipment: EquipmentRow[]): EquipmentPageData {
  const available = equipment.filter((e) => e.status === "available").length;
  const booked = equipment.filter((e) => e.status === "booked").length;

  return {
    stats: {
      total: equipment.length,
      available,
      booked,
    },
    equipment: equipment.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      status: e.status,
      daily_rate: e.daily_rate,
      location: e.location,
    })),
  };
}
