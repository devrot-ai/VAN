"use client";

import { useState } from "react";

/**
 * Submit assessment for review (farmers only).
 */
export function SubmitButton({ assessmentId }: { assessmentId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assessmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit assessment.");
        return;
      }
      window.location.reload();
    } catch {
      setError("Failed to submit assessment.");
    }
  }

  return (
    <div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-lg bg-[#728B51] px-4 py-2 text-sm font-medium text-white hover:bg-[#637a44] transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit for review"}
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Approve assessment (operations only).
 */
export function ApproveButton({ assessmentId }: { assessmentId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    if (!confirm("Approve this assessment? This will make it part of the farm's historical record.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assessments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assessmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to approve assessment.");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Failed to approve assessment.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleApprove}
        disabled={loading}
        className="rounded-lg bg-[#183B2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0f2619] transition-colors disabled:opacity-50"
      >
        {loading ? "Approving…" : "Approve assessment"}
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
