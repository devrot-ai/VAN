"use client";

import { useState, useTransition } from "react";
import { Panel, EmptyState } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";

export default function CropPlanEditor({ cycleId, existingPlan }: {
  cycleId: number;
  existingPlan: any;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [plan, setPlan] = useState(existingPlan);
  const [error, setError] = useState("");

  // Form state
  const [plantingMethod, setPlantingMethod] = useState(existingPlan?.planting_method || "");
  const [irrigationApproach, setIrrigationApproach] = useState(existingPlan?.irrigation_approach || "");
  const [fieldConditions, setFieldConditions] = useState(existingPlan?.field_conditions || "");
  const [planningNotes, setPlanningNotes] = useState(existingPlan?.planning_notes || "");

  const handleSave = () => {
    setError("");
    const body: any = {
      cropCycleId: cycleId,
      plantingMethod: plantingMethod.trim() || null,
      irrigationApproach: irrigationApproach.trim() || null,
      fieldConditions: fieldConditions.trim() || null,
      planningNotes: planningNotes.trim() || null,
    };

    const url = plan ? "/api/crop-cycles/[id]/plan" : "/api/crop-cycles/[id]/plan";
    const method = plan ? "PUT" : "POST";
    if (plan) body.planId = plan.id;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/plan`, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setPlan(data.plan);
          setEditing(false);
        } else {
          setError(data.error || "Failed to save crop plan.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to save crop plan.");
      }
    });
  };

  return (
    <Panel title="Crop Plan" actionLabel={plan && !editing ? "Edit plan" : undefined}>
      <div style={{ padding: "var(--space-5)" }}>
        {error && (
          <div style={{ padding: "var(--space-2) var(--space-3)", background: "#faeceb", border: "1px solid #e5b3a8", borderRadius: "var(--radius-sm)", color: "#7a2f24", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            {error}
          </div>
        )}

        {!plan && !editing ? (
          <>
            <EmptyState text="No crop plan yet. Create one to document your planting method, irrigation approach and field conditions." />
            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "var(--space-3)",
                padding: "0.55rem 1.25rem",
                border: "none",
                background: "var(--color-green)",
                color: "#fff",
                borderRadius: "var(--radius-sm)",
                font: "inherit",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create crop plan
            </button>
          </>
        ) : editing ? (
          <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 500 }}>
            <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <span>Planting Method</span>
              <select
                value={plantingMethod}
                onChange={(e) => setPlantingMethod(e.target.value)}
                style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
              >
                <option value="">Select method...</option>
                <option value="Direct seeding">Direct seeding</option>
                <option value="Transplanting">Transplanting</option>
                <option value="Broadcast">Broadcast</option>
                <option value="Drill seeding">Drill seeding</option>
                <option value="Row planting">Row planting</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <span>Irrigation Approach</span>
              <select
                value={irrigationApproach}
                onChange={(e) => setIrrigationApproach(e.target.value)}
                style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
              >
                <option value="">Select approach...</option>
                <option value="Rainfed">Rainfed</option>
                <option value="Flood irrigation">Flood irrigation</option>
                <option value="Drip irrigation">Drip irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Center pivot">Center pivot</option>
              </select>
            </label>

            <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <span>Field Conditions</span>
              <textarea
                value={fieldConditions}
                onChange={(e) => setFieldConditions(e.target.value)}
                rows={3}
                placeholder="Describe field conditions, drainage, slope, etc."
                style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)", resize: "vertical" }}
              />
            </label>

            <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              <span>Planning Notes</span>
              <textarea
                value={planningNotes}
                onChange={(e) => setPlanningNotes(e.target.value)}
                rows={2}
                placeholder="Additional notes about this plan..."
                style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)", resize: "vertical" }}
              />
            </label>

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button
                onClick={handleSave}
                disabled={pending}
                style={{
                  padding: "0.55rem 1.25rem",
                  border: "none",
                  background: pending ? "var(--line)" : "var(--color-green)",
                  color: "#fff",
                  borderRadius: "var(--radius-sm)",
                  font: "inherit",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  cursor: pending ? "default" : "pointer",
                }}
              >
                {pending ? "Saving..." : "Save plan"}
              </button>
              <button
                onClick={() => { setEditing(false); setError(""); }}
                style={{
                  padding: "0.55rem 1.25rem",
                  border: "1px solid var(--line)",
                  background: "var(--surface-page)",
                  borderRadius: "var(--radius-sm)",
                  font: "inherit",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <DetailRow label="Planting Method" value={plan?.planting_method || "—"} />
            <DetailRow label="Irrigation" value={plan?.irrigation_approach || "—"} />
            <DetailRow label="Field Conditions" value={plan?.field_conditions || "—"} />
            {plan?.planning_notes && <DetailRow label="Notes" value={plan.planning_notes} />}
            <DetailRow label="Status" value={plan?.status || "—"} />
            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "var(--space-2)",
                padding: "0.55rem 1.25rem",
                border: "none",
                background: "var(--color-green)",
                color: "#fff",
                borderRadius: "var(--radius-sm)",
                font: "inherit",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Edit plan
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-2) 0", borderBottom: "1px solid var(--line)", fontSize: "var(--text-sm)" }}>
      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{value}</span>
    </div>
  );
}
