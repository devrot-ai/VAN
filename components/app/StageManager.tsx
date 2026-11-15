"use client";

import { useState, useTransition } from "react";
import { Panel, EmptyState, badgeClass } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";

const SUGGESTED_STAGES = [
  "Land preparation",
  "Seed preparation",
  "Sowing",
  "Germination",
  "Vegetative growth",
  "Flowering",
  "Fruit/grain development",
  "Maturity",
  "Harvest readiness",
  "Harvest",
];

export default function StageManager({ cycleId, existingStages }: {
  cycleId: number;
  existingStages: any[];
}) {
  const [stages, setStages] = useState(existingStages);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Form state
  const [stageName, setStageName] = useState("");
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!stageName.trim()) {
      setError("Stage name is required.");
      return;
    }
    if (plannedStartDate && plannedEndDate && plannedEndDate < plannedStartDate) {
      setError("End date cannot be before start date.");
      return;
    }

    const body: any = {
      cropCycleId: cycleId,
      stageName: stageName.trim(),
      description: description.trim() || null,
    };
    if (plannedStartDate) body.plannedStartDate = plannedStartDate;
    if (plannedEndDate) body.plannedEndDate = plannedEndDate;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/stages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setStages((prev) => [...prev, data.stage]);
          setAdding(false);
          setStageName("");
          setPlannedStartDate("");
          setPlannedEndDate("");
          setDescription("");
          setError("");
        } else {
          setError(data.error || "Failed to create stage.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to create stage.");
      }
    });
  };

  const handleUpdate = (stage: any) => {
    const body: any = {
      stageId: stage.id,
      stageName: stage.stage_name,
      plannedStartDate: stage.planned_start_date || null,
      plannedEndDate: stage.planned_end_date || null,
      status: stage.status,
      description: stage.description || null,
    };

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/stages`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setStages((prev) => prev.map((s) => s.id === data.stage.id ? data.stage : s));
          setEditingId(null);
        } else {
          setError(data.error || "Failed to update stage.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to update stage.");
      }
    });
  };

  const handleDelete = (stageId: number) => {
    if (!confirm("Delete this stage?")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/stages`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stageId }),
        });
        const data = await res.json();
        if (data.ok) {
          setStages((prev) => prev.filter((s) => s.id !== stageId));
        } else {
          setError(data.error || "Failed to delete stage.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete stage.");
      }
    });
  };

  const sortedStages = [...stages].sort((a, b) => a.sequence - b.sequence);

  return (
    <Panel title="Growth Stages">
      <div style={{ padding: "var(--space-5)" }}>
        {error && (
          <div style={{ padding: "var(--space-2) var(--space-3)", background: "#faeceb", border: "1px solid #e5b3a8", borderRadius: "var(--radius-sm)", color: "#7a2f24", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            {error}
          </div>
        )}

        {sortedStages.length === 0 && !adding ? (
          <>
            <EmptyState text="No growth stages defined yet. Add stages to track your crop development." />
            <button
              onClick={() => setAdding(true)}
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
              + Add stage
            </button>
          </>
        ) : (
          <>
            {/* Stages list */}
            <div style={{ display: "grid", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
              {sortedStages.map((stage: any, idx: number) => (
                <StageRow
                  key={stage.id}
                  stage={stage}
                  index={idx + 1}
                  editing={editingId === stage.id}
                  onEdit={() => setEditingId(stage.id)}
                  onSave={() => handleUpdate(stage)}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDelete(stage.id)}
                />
              ))}
            </div>

            {/* Add stage */}
            {adding ? (
              <AddStageForm
                stageName={stageName}
                setStageName={setStageName}
                plannedStartDate={plannedStartDate}
                setPlannedStartDate={setPlannedStartDate}
                plannedEndDate={plannedEndDate}
                setPlannedEndDate={setPlannedEndDate}
                description={description}
                setDescription={setDescription}
                suggestedStages={SUGGESTED_STAGES}
                onAdd={handleAdd}
                onCancel={() => { setAdding(false); setError(""); }}
                pending={pending}
              />
            ) : (
              <button
                onClick={() => setAdding(true)}
                style={{
                  padding: "0.55rem 1.25rem",
                  border: "1px dashed var(--line)",
                  background: "transparent",
                  borderRadius: "var(--radius-sm)",
                  font: "inherit",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-green)",
                  cursor: "pointer",
                }}
              >
                + Add stage
              </button>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

function StageRow({ stage, index, editing, onEdit, onSave, onCancel, onDelete }: {
  stage: any;
  index: number;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  if (!editing) {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "30px 1fr auto",
        gap: "var(--space-3)",
        alignItems: "center",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--surface-page)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--line)",
      }}>
        <span style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--color-green)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--text-xs)",
          fontWeight: 700,
        }}>
          {index}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{stage.stage_name}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            {stage.planned_start_date && stage.planned_end_date
              ? `${formatDate(stage.planned_start_date)} → ${formatDate(stage.planned_end_date)}`
              : "No dates set"}
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <span className={badgeClass(stage.status)}>{stage.status}</span>
          <button onClick={onEdit} className={styles.actBtn}>Edit</button>
          <button onClick={onDelete} className={styles.actBtn}>Delete</button>
        </div>
      </div>
    );
  }

  // Editing mode — inline status update
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "30px 1fr auto",
      gap: "var(--space-3)",
      alignItems: "center",
      padding: "var(--space-3) var(--space-4)",
      background: "var(--surface-page)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--color-green)",
    }}>
      <span style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "var(--color-green)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
      }}>
        {index}
      </span>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{stage.stage_name}</div>
        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
          <span>Status</span>
          <select
            value={stage.status}
            onChange={(e) => { stage.status = e.target.value; }}
            style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-xs)" }}
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button onClick={onSave} className={styles.actBtnAccept}>Save</button>
        <button onClick={onCancel} className={styles.actBtn}>Cancel</button>
      </div>
    </div>
  );
}

function AddStageForm({
  stageName, setStageName,
  plannedStartDate, setPlannedStartDate,
  plannedEndDate, setPlannedEndDate,
  description, setDescription,
  suggestedStages,
  onAdd, onCancel, pending,
}: {
  stageName: string; setStageName: (v: string) => void;
  plannedStartDate: string; setPlannedStartDate: (v: string) => void;
  plannedEndDate: string; setPlannedEndDate: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  suggestedStages: string[];
  onAdd: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div style={{
      padding: "var(--space-4)",
      background: "var(--surface-page)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--line)",
      display: "grid",
      gap: "var(--space-3)",
    }}>
      <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <span>Stage Name *</span>
        <input
          type="text"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          placeholder="e.g., Vegetative growth"
          style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
        />
        <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
          {suggestedStages.map((s) => (
            <button
              key={s}
              onClick={() => setStageName(s)}
              style={{
                padding: "2px 8px",
                fontSize: "var(--text-xs)",
                border: "1px solid var(--line)",
                background: "transparent",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Planned Start</span>
          <input
            type="date"
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>
        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Planned End</span>
          <input
            type="date"
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>
      </div>

      <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <span>Description (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Describe what happens during this stage..."
          style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)", resize: "vertical" }}
        />
      </label>

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button
          onClick={onAdd}
          disabled={pending || !stageName.trim()}
          style={{
            padding: "0.55rem 1.25rem",
            border: "none",
            background: (pending || !stageName.trim()) ? "var(--line)" : "var(--color-green)",
            color: "#fff",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: pending ? "default" : "pointer",
          }}
        >
          {pending ? "Adding..." : "Add stage"}
        </button>
        <button
          onClick={onCancel}
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
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}
