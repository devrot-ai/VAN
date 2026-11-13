"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/db/types";
import styles from "@/components/app/app.module.css";

const ROLES: Role[] = ["farmer", "provider", "cooperative", "buyer", "operations"];

export default function RoleChangeSelect({
  userId,
  currentRole,
}: {
  userId: number;
  currentRole: Role;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    if (newRole === currentRole) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/operations/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${res.status})`);
      }
      setRole(newRole);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      <select
        className={styles.filterField}
        value={role}
        disabled={loading}
        onChange={handleChange}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {error && <span style={{ color: "var(--danger)", fontSize: "0.75rem", marginLeft: "4px" }}>{error}</span>}
    </span>
  );
}
