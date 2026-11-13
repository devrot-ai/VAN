"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PORTAL_HOME } from "@/lib/portals";
import type { Role } from "@/lib/db";
import styles from "@/app/auth/auth.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const role = data.user.role as Role;
        router.push(PORTAL_HOME[role] ?? "/app");
        router.refresh();
      } else {
        setError(data.error || "Could not sign in.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <div className={styles.errorBanner} role="alert">{error}</div> : null}
      <Input label="Email" type="email" name="email" required autoComplete="email"
        placeholder="you@farm.com"
        value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      <Input label="Password" type="password" name="password" required autoComplete="current-password"
        value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
      <label className={styles.remember}>
        <input type="checkbox" checked={form.remember}
          onChange={(e) => setForm((f) => ({ ...f, remember: e.target.checked }))} />
        <span>Keep me signed in for 30 days</span>
      </label>
      <Button type="submit" variant="primary" size="lg" block disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <div className={styles.demo}>
        <strong>Demo account</strong> — email <strong>demo@van.farm</strong>, password <strong>demo1234</strong>
      </div>
    </form>
  );
}
