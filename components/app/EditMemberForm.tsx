"use client";

import styles from "./app.module.css";
import { useForm } from "@/lib/useForm";

/**
 * Inline edit form for a member record.
 */
export default function EditMemberForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { name: string; farm: string; status: string; fieldsCount: number };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/members",
    method: "PUT",
    id,
    initialValues: {
      name: initial.name,
      farm: initial.farm,
      status: initial.status,
      fieldsCount: String(initial.fieldsCount),
    },
    optionalFields: ["farm"],
    successMessage: "Member updated.",
  });

  return (
    <form className={styles.profileForm} onSubmit={onSubmit}>
      {saved ? <div className={styles.profileSaved} role="status">Member updated.</div> : null}
      {error ? <div className={styles.requestError} role="alert">{error}</div> : null}
      <label>
        <span>Name *</span>
        <input required value={form.name} onChange={(e) => setField("name", e.target.value)} maxLength={120} />
      </label>
      <label>
        <span>Farm</span>
        <input value={form.farm} onChange={(e) => setField("farm", e.target.value)} maxLength={120} />
      </label>
      <label>
        <span>Status</span>
        <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label>
        <span>Fields count</span>
        <input
          type="number"
          min="0"
          value={form.fieldsCount}
          onChange={(e) => setField("fieldsCount", e.target.value)}
        />
      </label>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</button>
        <button type="button" className={styles.actBtn} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
