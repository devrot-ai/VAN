"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/app/app.module.css";

const TRANSITIONS: Record<string, Array<{ label: string; status: string }>> = {
  enquiry: [{ label: "Accept as offer", status: "offer" }],
  offer: [
    { label: "Confirm purchase", status: "confirmed" },
    { label: "Decline", status: "declined" },
  ],
  confirmed: [{ label: "Mark delivered", status: "delivered" }],
  delivered: [],
  declined: [],
};

export default function PurchaseStatusActions({
  purchaseId,
  currentStatus,
}: {
  purchaseId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const actions = TRANSITIONS[currentStatus] ?? [];
  if (actions.length === 0) return null;

  const handleClick = async (action: { label: string; status: string }) => {
    if (!confirm(`Really "${action.label}" this purchase?`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/purchases/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: purchaseId, status: action.status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.rowActions}>
      {actions.map((action) => (
        <button
          key={action.status}
          className={styles.actBtn}
          disabled={loading}
          onClick={() => handleClick(action)}
        >
          {action.label}
        </button>
      ))}
      {error && <span style={{ color: "var(--danger)", fontSize: "0.8rem" }}>{error}</span>}
    </div>
  );
}
