"use client";

import { useState, useEffect } from "react";
import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for a harvest record.
 */
export default function EditHarvestForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { fieldId: number; crop: string; quantityTonnes: number; date: string; quality: string; status: string };
  onCancel: () => void;
}) {
  const [fieldOptions, setFieldOptions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/fields")
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.ok && Array.isArray(data.fields)) {
          setFieldOptions(data.fields.map((f: any) => ({ id: f.id, name: f.name })));
        }
      });
  }, []);

  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/harvests",
    method: "PUT",
    id,
    initialValues: {
      fieldId: String(initial.fieldId),
      crop: initial.crop,
      quantityTonnes: String(initial.quantityTonnes),
      date: initial.date,
      quality: initial.quality,
      status: initial.status,
    },
    optionalFields: ["quality"],
    transformPayload: (p) => ({
      ...p,
      fieldId: Number(p.fieldId),
      quantityTonnes: Number(p.quantityTonnes),
    }),
    successMessage: "Harvest updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Harvest updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Field *</span>
        <select
          required
          value={form.fieldId}
          onChange={(e) => setField("fieldId", e.target.value)}
        >
          <option value="">Select field</option>
          {fieldOptions.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Crop *</span>
        <input
          required
          value={form.crop}
          onChange={(e) => setField("crop", e.target.value)}
          maxLength={100}
        />
      </label>
      <label>
        <span>Quantity (tonnes) *</span>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          value={form.quantityTonnes}
          onChange={(e) => setField("quantityTonnes", e.target.value)}
        />
      </label>
      <label>
        <span>Date *</span>
        <input
          required
          type="date"
          value={form.date}
          onChange={(e) => setField("date", e.target.value)}
        />
      </label>
      <label>
        <span>Quality</span>
        <select value={form.quality} onChange={(e) => setField("quality", e.target.value)}>
          <option value="">—</option>
          <option value="premium">Premium</option>
          <option value="standard">Standard</option>
          <option value="below-standard">Below standard</option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="planned">Planned</option>
          <option value="ready">Ready</option>
          <option value="harvested">Harvested</option>
          <option value="sold">Sold</option>
        </select>
      </label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.actBtn} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
