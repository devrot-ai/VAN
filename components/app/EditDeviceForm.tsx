"use client";

import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for a device record.
 */
export default function EditDeviceForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { name: string; kind: string; status: string; location: string };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/devices",
    method: "PUT",
    id,
    initialValues: {
      name: initial.name,
      kind: initial.kind,
      status: initial.status,
      location: initial.location,
    },
    optionalFields: ["location"],
    successMessage: "Device updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Device updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Device name *</span>
        <input required value={form.name} onChange={(e) => setField("name", e.target.value)} maxLength={120} />
      </label>
      <label>
        <span>Type *</span>
        <select required value={form.kind} onChange={(e) => setField("kind", e.target.value)}>
          <option value="">Select type</option>
          <option value="weather">Weather station</option>
          <option value="sensor">Sensor</option>
          <option value="hub">Hub</option>
          <option value="machine">Machine controller</option>
          <option value="camera">Camera</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="maintenance">Maintenance</option>
        </select>
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
