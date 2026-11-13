import { describe, it, expect } from "vitest";
import { presentPurchasesPage } from "./purchases";
import type { PurchaseRow } from "@/lib/db/types";

describe("presentPurchasesPage", () => {
  const purchases: PurchaseRow[] = [
    { id: 1, user_id: 1, lot: "Rice A", buyer: "Farm A", quantity_tonnes: 5, amount: 1000, status: "enquiry", created_at: "2025-01-01" },
    { id: 2, user_id: 1, lot: "Wheat B", buyer: "Farm B", quantity_tonnes: 3, amount: 600, status: "confirmed", created_at: "2025-01-01" },
    { id: 3, user_id: 1, lot: "Corn C", buyer: "Farm C", quantity_tonnes: 2, amount: 400, status: "delivered", created_at: "2025-01-01" },
  ];

  it("computes purchase stats by status", () => {
    const data = presentPurchasesPage(purchases);
    expect(data.stats.enquiries).toBe(1);
    expect(data.stats.confirmed).toBe(1);
    expect(data.stats.delivered).toBe(1);
  });

  it("returns all purchases", () => {
    const data = presentPurchasesPage(purchases);
    expect(data.purchases).toHaveLength(3);
  });

  it("handles empty data", () => {
    const data = presentPurchasesPage([]);
    expect(data.stats.enquiries).toBe(0);
    expect(data.purchases).toHaveLength(0);
  });
});
