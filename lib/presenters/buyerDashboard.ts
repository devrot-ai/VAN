/**
 * Buyer dashboard presenter.
 */

import type { PurchaseRow, HarvestAvailabilityRow } from "@/lib/db/types";

export interface PurchaseListItem {
  id: number;
  lot: string;
  buyer: string | null;
  quantity_tonnes: number;
  status: string;
}

export interface HarvestListItem {
  harvest_id: number;
  crop: string;
  quantity_tonnes: number;
  farmer_name: string;
  farm_name: string | null;
  date: string;
  status: string;
}

export interface BuyerDashboardData {
  stats: {
    purchasesCount: number;
    volumeTonnes: number;
    openEnquiries: number;
    confirmed: number;
  };
  recentPurchases: PurchaseListItem[];
  harvestAvailability: HarvestListItem[];
}

export function presentBuyerDashboard(
  purchases: PurchaseRow[],
  harvestAvailability: HarvestAvailabilityRow[],
): BuyerDashboardData {
  const enquiries = purchases.filter((p) => p.status === "enquiry");
  const confirmed = purchases.filter((p) => p.status === "confirmed");
  const volume = purchases.reduce((s, p) => s + Number(p.quantity_tonnes || 0), 0);

  return {
    stats: {
      purchasesCount: purchases.length,
      volumeTonnes: volume,
      openEnquiries: enquiries.length,
      confirmed: confirmed.length,
    },
    recentPurchases: purchases.map((p) => ({
      id: p.id,
      lot: p.lot,
      buyer: p.buyer,
      quantity_tonnes: p.quantity_tonnes,
      status: p.status,
    })),
    harvestAvailability: harvestAvailability.slice(0, 5).map((h) => ({
      harvest_id: h.harvest_id,
      crop: h.crop,
      quantity_tonnes: h.quantity_tonnes,
      farmer_name: h.farmer_name,
      farm_name: h.farm_name,
      date: h.date,
      status: h.status,
    })),
  };
}
