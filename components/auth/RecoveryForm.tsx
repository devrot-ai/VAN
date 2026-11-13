"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "@/app/auth/auth.module.css";

export default function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        if (data.resetLink) setResetLink(data.resetLink);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className={styles.demo}>
        <strong>Check your inbox</strong>
        <p style={{ marginTop: "var(--space-2)" }}>
          If an account exists for that email, a single-use reset link is on its way.
          The link expires after one hour.
        </p>
        {resetLink ? (
          <>
            <p style={{ marginTop: "var(--space-2)" }}>
              <strong>Note:</strong> email delivery is not connected in this environment,
              so in place of an email, here is your reset link.
            </p>
            <p style={{ marginTop: "var(--space-2)" }}>
              <a href={resetLink}>Open your password reset link →</a>
            </p>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <div className={styles.errorBanner} role="alert">{error}</div> : null}
      <Input label="Email" type="email" name="email" required autoComplete="email"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit" variant="primary" size="lg" block disabled={loading}>
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
