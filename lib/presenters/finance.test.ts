import { describe, it, expect } from "vitest";
import { presentFinancePage } from "./finance";
import type { TransactionRow, BookingRow } from "@/lib/db/types";

describe("presentFinancePage", () => {
  const transactions: TransactionRow[] = [
    { id: 1, user_id: 1, date: "2025-05-01", description: "Seeds", amount: 100, type: "expense", category: "seeds", created_at: "2025-01-01" },
    { id: 2, user_id: 1, date: "2025-05-02", description: "Sale", amount: 500, type: "income", category: "sales", created_at: "2025-01-01" },
    { id: 3, user_id: 1, date: "2025-05-03", description: "Fertilizer", amount: 200, type: "expense", category: "seeds", created_at: "2025-01-01" },
  ];
  const bookings: BookingRow[] = [
    { id: 1, user_id: 1, pair_id: 2, equipment_id: 1, title: "Tractor", when_date: "2025-06-01", end_date: "2025-06-03", status: "confirmed", amount: 1000, note: null, kind: "request", created_at: "2025-01-01" },
  ];

  it("computes expense and income totals", () => {
    const data = presentFinancePage(transactions, bookings);
    expect(data.stats.totalExpenses).toBe(300);
    expect(data.stats.totalIncome).toBe(500);
    expect(data.stats.transactionsCount).toBe(3);
  });

  it("groups expenses by category", () => {
    const data = presentFinancePage(transactions, bookings);
    expect(data.expenseAnalytics).toHaveLength(1);
    expect(data.expenseAnalytics[0].label).toBe("seeds");
    expect(data.expenseAnalytics[0].value).toBe(300);
  });

  it("groups income by category", () => {
    const data = presentFinancePage(transactions, bookings);
    expect(data.incomeAnalytics).toHaveLength(1);
    expect(data.incomeAnalytics[0].label).toBe("sales");
    expect(data.incomeAnalytics[0].value).toBe(500);
  });

  it("handles empty data", () => {
    const data = presentFinancePage([], []);
    expect(data.stats.totalExpenses).toBe(0);
    expect(data.stats.totalIncome).toBe(0);
    expect(data.transactions).toHaveLength(0);
  });
});
