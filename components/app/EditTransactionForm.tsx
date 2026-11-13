"use client";

import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for a transaction record.
 */
export default function EditTransactionForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { date: string; description: string; amount: number; type: string; category: string };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/transactions",
    method: "PUT",
    id,
    initialValues: {
      date: initial.date,
      description: initial.description,
      amount: String(initial.amount),
      type: initial.type,
      category: initial.category,
    },
    optionalFields: ["category"],
    successMessage: "Transaction updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Transaction updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Date *</span>
        <input required type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
      </label>
      <label>
        <span>Description *</span>
        <input
          required
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          maxLength={200}
        />
      </label>
      <label>
        <span>Amount *</span>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount}
          onChange={(e) => setField("amount", e.target.value)}
        />
      </label>
      <label>
        <span>Type</span>
        <select value={form.type} onChange={(e) => setField("type", e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label>
        <span>Category</span>
        <input value={form.category} onChange={(e) => setField("category", e.target.value)} maxLength={60} />
      </label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.actBtn} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
