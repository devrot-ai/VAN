"use client";

import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for an equipment record.
 */
export default function EditEquipmentForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { name: string; category: string; status: string; dailyRate: number; location: string };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/equipment",
    method: "PUT",
    id,
    initialValues: {
      name: initial.name,
      category: initial.category,
      status: initial.status,
      dailyRate: String(initial.dailyRate ?? ""),
      location: initial.location,
    },
    optionalFields: ["category", "dailyRate", "location"],
    successMessage: "Equipment updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Equipment updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Name *</span>
        <input required value={form.name} onChange={(e) => setField("name", e.target.value)} maxLength={120} />
      </label>
      <label>
        <span>Category</span>
        <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
          <option value="">—</option>
          <option value="tractor">Tractor</option>
          <option value="harvester">Harvester</option>
          <option value="sprayer">Sprayer</option>
          <option value="plough">Plough</option>
          <option value="seeder">Seeder</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </label>
      <label>
        <span>Daily rate (₹)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={form.dailyRate}
          onChange={(e) => setField("dailyRate", e.target.value)}
        />
      </label>
      <label>
        <span>Location</span>
        <input value={form.location} onChange={(e) => setField("location", e.target.value)} maxLength={120} />
      </label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.actBtn} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
