"use client";

import { useState, useEffect } from "react";
import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for a maintenance record.
 */
export default function EditMaintenanceForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { equipmentId: number; task: string; dueDate: string; status: string; notes: string };
  onCancel: () => void;
}) {
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/equipment")
      .then((res) => res.json().catch(() => ({})))
      .then((data) => {
        if (data.ok && Array.isArray(data.equipment)) {
          setEquipmentOptions(data.equipment.map((e: any) => ({ id: e.id, name: e.name })));
        }
      });
  }, []);

  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/maintenance",
    method: "PUT",
    id,
    initialValues: {
      equipmentId: String(initial.equipmentId),
      task: initial.task,
      dueDate: initial.dueDate,
      status: initial.status,
      notes: initial.notes,
    },
    optionalFields: ["dueDate", "notes"],
    transformPayload: (p) => ({ ...p, equipmentId: Number(p.equipmentId) }),
    successMessage: "Maintenance updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Maintenance updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Equipment *</span>
        <select
          required
          value={form.equipmentId}
          onChange={(e) => setField("equipmentId", e.target.value)}
        >
          <option value="">Select equipment</option>
          {equipmentOptions.map((eq) => (
            <option key={eq.id} value={eq.id}>{eq.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Task *</span>
        <input
          required
          value={form.task}
          onChange={(e) => setField("task", e.target.value)}
          maxLength={200}
        />
      </label>
      <label>
        <span>Due date</span>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setField("dueDate", e.target.value)}
        />
      </label>
      <label>
        <span>Status</span>
        <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label>
        <span>Notes</span>
        <input value={form.notes} onChange={(e) => setField("notes", e.target.value)} maxLength={500} />
      </label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.actBtn} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
