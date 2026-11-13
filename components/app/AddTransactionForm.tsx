"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new transaction (income or expense). Posts to /api/transactions.
 */
export default function AddTransactionForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/transactions",
    initialValues: { date: "", description: "", amount: "", type: "expense", category: "" },
    optionalFields: ["category"],
    successMessage: "Transaction added.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Transaction added.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
          />
          <Input
            label="Description"
            required
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            maxLength={200}
            placeholder="e.g. Seed purchase, Grain sale"
          />
          <Input
            label="Amount"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setField("amount", e.target.value)}
            placeholder="e.g. 150.00"
          />
          <Select
            label="Type"
            required
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            maxLength={60}
            placeholder="e.g. Inputs, Sales, Labour"
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Adding…" : "Add transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
