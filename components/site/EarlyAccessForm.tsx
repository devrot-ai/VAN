"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import styles from "./EarlyAccess.module.css";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

export default function EarlyAccessForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "farmer",
    farm: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.duplicate) {
        setStatus("duplicate");
        setMessage(data.message || "You’re already on the list. We’ll be in touch.");
      } else if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks — you’re on the list. We’ll be in touch.");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success" || status === "duplicate") {
    return (
      <div className={`${styles.panel} ${styles.panelSuccess}`} role="status">
        <span className={styles.statusIcon}>✓</span>
        <div>
          <h3 className={styles.statusTitle}>
            {status === "success" ? "You’re on the list" : "Already on the list"}
          </h3>
          <p className={styles.statusText}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {status === "error" ? (
        <div className={styles.errorBanner} role="alert">
          {message}
        </div>
      ) : null}
      <div className={styles.grid}>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Alex Morgan"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="alex@farm.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <Select
          label="I am a"
          name="role"
          value={form.role}
          onChange={(e) => update("role", e.target.value)}
        >
          <option value="farmer">Farmer / farm manager</option>
          <option value="owner">Equipment owner</option>
          <option value="provider">Service provider</option>
          <option value="cooperative">Cooperative</option>
          <option value="buyer">Buyer</option>
          <option value="other">Something else</option>
        </Select>
        {!compact ? (
          <Input
            label="Farm or business name (optional)"
            name="farm"
            placeholder="Morgan Fields"
            value={form.farm}
            onChange={(e) => update("farm", e.target.value)}
          />
        ) : null}
      </div>
      <Button type="submit" variant="primary" size="lg" block disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Request early access"}
      </Button>
      <p className={styles.note}>
        We’ll only use this to contact you about VAN. No spam, no sharing.
      </p>
    </form>
  );
}
