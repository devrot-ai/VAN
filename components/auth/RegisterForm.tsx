"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { PORTAL_HOME } from "@/lib/portals";
import type { Role } from "@/lib/db";
import styles from "@/app/auth/auth.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLink, setVerifyLink] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "farmer", farmName: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (data.verifyLink) {
          // Email delivery isn't configured in this environment, so the
          // verification link is shown here instead of being emailed.
          setVerifyLink(data.verifyLink);
          setLoading(false);
          return;
        }
        const role = data.user.role as Role;
        router.push(PORTAL_HOME[role] ?? "/app");
        router.refresh();
      } else {
        setError(data.error || "Could not create your account.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (verifyLink) {
    return (
      <div className={styles.demo}>
        <strong>One more step — verify your email</strong>
        <p style={{ marginTop: "var(--space-2)" }}>
          Your account is created. Email delivery is not connected in this environment,
          so your verification link is below. Open it to confirm this address.
        </p>
        <p style={{ marginTop: "var(--space-2)" }}>
          <a href={verifyLink}>Verify this email address →</a>
        </p>
        <p style={{ marginTop: "var(--space-3)" }}>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            const role = form.role as Role;
            router.push(PORTAL_HOME[role] ?? "/app");
          }}>Skip for now and continue</a>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <div className={styles.errorBanner} role="alert">{error}</div> : null}
      <Input label="Full name" name="name" required autoComplete="name"
        value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Input label="Email" type="email" name="email" required autoComplete="email"
        value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      <Input label="Password (8+ characters)" type="password" name="password" required minLength={8} autoComplete="new-password"
        value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
      <Select label="What kind of account?" name="role"
        value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
        <option value="farmer">Farmer / farm manager</option>
        <option value="provider">Equipment or service provider</option>
        <option value="cooperative">Cooperative</option>
        <option value="buyer">Buyer</option>
      </Select>
      <Input label="Farm or business name (optional)" name="farmName"
        value={form.farmName} onChange={(e) => setForm((f) => ({ ...f, farmName: e.target.value }))} />
      <Button type="submit" variant="primary" size="lg" block disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
