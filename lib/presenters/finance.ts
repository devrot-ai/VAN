/**
 * Finance page presenter.
 */

import type { TransactionRow, BookingRow } from "@/lib/db/types";
import type { AnalyticsItem } from "./farmerDashboard";

export interface TransactionListItem {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string | null;
}

export interface CommitmentListItem {
  id: number;
  title: string;
  counterparty: string | null;
  when_date: string | null;
  status: string;
}

export interface FinancePageData {
  stats: {
    committedBookings: number;
    totalExpenses: number;
    totalIncome: number;
    transactionsCount: number;
  };
  transactions: TransactionListItem[];
  commitments: CommitmentListItem[];
  expenseAnalytics: AnalyticsItem[];
  incomeAnalytics: AnalyticsItem[];
}

export function presentFinancePage(
  transactions: TransactionRow[],
  bookings: BookingRow[],
): FinancePageData {
  const commitments = bookings;
  const outstanding = commitments
    .filter((b) => b.amount)
    .reduce((s, b) => s + Number(b.amount || 0), 0);

  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income");
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);

  // Expense by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((t) => {
    const cat = t.category || "uncategorized";
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
  });
  const expenseAnalytics: AnalyticsItem[] = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value: Math.round(value), color: "#c0392b" }));

  // Income by category
  const incomeByCategory: Record<string, number> = {};
  income.forEach((t) => {
    const cat = t.category || "uncategorized";
    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + t.amount;
  });
  const incomeAnalytics: AnalyticsItem[] = Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value: Math.round(value) }));

  return {
    stats: {
      committedBookings: outstanding,
      totalExpenses,
      totalIncome,
      transactionsCount: transactions.length,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
    })),
    commitments: commitments.map((b) => ({
      id: b.id,
      title: b.title,
      counterparty: b.counterparty,
      when_date: b.when_date,
      status: b.status,
    })),
    expenseAnalytics,
    incomeAnalytics,
  };
}
