/**
 * Purchases page presenter (buyer portal).
 */

import type { PurchaseRow } from "@/lib/db/types";

export interface BuyerPurchaseItem {
  id: number;
  lot: string;
  buyer: string | null;
  quantity_tonnes: number;
  amount: number;
  status: string;
}

export interface PurchasesPageData {
  stats: {
    total: number;
    enquiries: number;
    confirmed: number;
    delivered: number;
  };
  purchases: BuyerPurchaseItem[];
}

export function presentPurchasesPage(purchases: PurchaseRow[]): PurchasesPageData {
  return {
    stats: {
      total: purchases.length,
      enquiries: purchases.filter((p) => p.status === "enquiry").length,
      confirmed: purchases.filter((p) => p.status === "confirmed").length,
      delivered: purchases.filter((p) => p.status === "delivered").length,
    },
    purchases: purchases.map((p) => ({
      id: p.id,
      lot: p.lot,
      buyer: p.buyer,
      quantity_tonnes: p.quantity_tonnes,
      amount: p.amount,
      status: p.status,
    })),
  };
}
