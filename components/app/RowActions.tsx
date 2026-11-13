"use client";

import { useRouter } from "next/navigation";
import styles from "./app.module.css";

/**
 * Reusable edit/delete button pair for entity list rows.
 * Calls the given API endpoint for delete with confirmation.
 */
export default function RowActions({
  id,
  apiPath,
  onEdit,
}: {
  id: number;
  apiPath: string;
  onEdit: () => void;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const res = await fetch(apiPath, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silent
    }
  }

  return (
    <span className={styles.rowActions}>
      <button className={styles.actBtn} onClick={onEdit}>Edit</button>
      <button className={styles.actBtn} onClick={handleDelete}>Delete</button>
    </span>
  );
}
