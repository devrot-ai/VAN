"use client";

import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for a purchase record.
 */
export default function EditPurchaseForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { lot: string; buyer: string; quantityTonnes: number; amount: number; status: string };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/purchases",
    method: "PUT",
    id,
    initialValues: {
      lot: initial.lot,
      buyer: initial.buyer,
      quantityTonnes: String(initial.quantityTonnes),
      amount: String(initial.amount),
      status: initial.status,
    },
    optionalFields: ["buyer"],
    successMessage: "Purchase updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Purchase updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Lot *</span>
        <input required value={form.lot} onChange={(e) => setField("lot", e.target.value)} maxLength={200} />
      </label>
      <label>
        <span>Buyer</span>
        <input value={form.buyer} onChange={(e) => setField("buyer", e.target.value)} maxLength={120} />
      </label>
      <label>
        <span>Quantity (tonnes)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.quantityTonnes}
          onChange={(e) => setField("quantityTonnes", e.target.value)}
        />
      </label>
      <label>
        <span>Amount (₹)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={(e) => setField("amount", e.target.value)}
        />
      </label>
      <label>
        <span>Status</span>
        <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="enquiry">Enquiry</option>
          <option value="offer">Offer</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="declined">Declined</option>
        </select>
      </label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.actBtn} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
