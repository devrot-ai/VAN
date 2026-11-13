"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import styles from "./EarlyAccess.module.css";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "" });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for reaching out. We’ll reply within two working days.");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`${styles.panel} ${styles.panelSuccess}`} role="status">
        <span className={styles.statusIcon}>✓</span>
        <div>
          <h3 className={styles.statusTitle}>Message sent</h3>
          <p className={styles.statusText}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {status === "error" ? (
        <div className={styles.errorBanner} role="alert">{message}</div>
      ) : null}
      <div className={styles.grid}>
        <Input label="Your name" name="name" required value={form.name}
          onChange={(e) => update("name", e.target.value)} placeholder="Alex Morgan" />
        <Input label="Email" name="email" type="email" required value={form.email}
          onChange={(e) => update("email", e.target.value)} placeholder="alex@farm.com" />
      </div>
      <Input label="Subject" name="subject" required value={form.subject}
        onChange={(e) => update("subject", e.target.value)} placeholder="How can we help?" />
      <Textarea label="Message" name="body" required rows={5} value={form.body}
        onChange={(e) => update("body", e.target.value)}
        placeholder="Tell us a little about your farm and what you need." />
      <Button type="submit" variant="primary" size="lg" block disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
