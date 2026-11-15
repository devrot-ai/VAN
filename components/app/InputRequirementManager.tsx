"use client";

import { useState, useTransition } from "react";
import { Panel, EmptyState, badgeClass } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";

const INPUT_CATEGORIES = [
  "Seeds",
  "Fertiliser",
  "Pesticide",
  "Herbicide",
  "Fungicide",
  "Soil amendment",
  "Irrigation supplies",
  "Mulch",
  "Other",
];

const UNITS: Record<string, string[]> = {
  "Seeds": ["kg", "g", "packets"],
  "Fertiliser": ["kg", "tonnes", "litres"],
  "Pesticide": ["litres", "ml", "kg"],
  "Herbicide": ["litres", "ml", "kg"],
  "Fungicide": ["litres", "ml", "kg"],
  "Soil amendment": ["kg", "tonnes"],
  "Irrigation supplies": ["units", "metres"],
  "Mulch": ["kg", "tonnes", "bales"],
  "Other": ["kg", "litres", "units"],
};

export default function InputRequirementManager({ cycleId, existingRequirements, cultivatedAreaHa }: {
  cycleId: number;
  existingRequirements: any[];
  cultivatedAreaHa: number;
}) {
  const [requirements, setRequirements] = useState(existingRequirements);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Form state
  const [inputCategory, setInputCategory] = useState("Seeds");
  const [productName, setProductName] = useState("");
  const [plannedQuantity, setPlannedQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [ratePerHa, setRatePerHa] = useState("");
  const [plannedApplicationDate, setPlannedApplicationDate] = useState("");
  const [intendedPurpose, setIntendedPurpose] = useState("");
  const [estimatedUnitPrice, setEstimatedUnitPrice] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate quantity from rate/ha
  const calculatedQuantity = ratePerHa && cultivatedAreaHa
    ? (parseFloat(ratePerHa) * cultivatedAreaHa).toFixed(2)
    : null;

  // Calculate estimated cost
  const estimatedCost = plannedQuantity && estimatedUnitPrice
    ? (parseFloat(plannedQuantity) * parseFloat(estimatedUnitPrice)).toFixed(2)
    : null;

  // Update units when category changes
  const handleCategoryChange = (cat: string) => {
    setInputCategory(cat);
    const availableUnits = UNITS[cat] || ["kg"];
    setUnit(availableUnits[0]);
  };

  const handleAdd = () => {
    if (!inputCategory) {
      setError("Input category is required.");
      return;
    }
    if (!plannedQuantity || parseFloat(plannedQuantity) <= 0) {
      setError("Planned quantity must be positive.");
      return;
    }

    const body: any = {
      cropCycleId: cycleId,
      inputCategory,
      productName: productName.trim() || null,
      plannedQuantity: parseFloat(plannedQuantity),
      unit,
      plannedApplicationDate: plannedApplicationDate || null,
      intendedPurpose: intendedPurpose.trim() || null,
      notes: notes.trim() || null,
    };
    if (ratePerHa) body.ratePerHa = parseFloat(ratePerHa);
    if (estimatedUnitPrice) body.estimatedUnitPrice = parseFloat(estimatedUnitPrice);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/input-requirements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setRequirements((prev) => [...prev, data.requirement]);
          setAdding(false);
          resetForm();
          setError("");
        } else {
          setError(data.error || "Failed to create requirement.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to create requirement.");
      }
    });
  };

  const handleUpdate = (req: any) => {
    const body: any = {
      requirementId: req.id,
      inputCategory: req.input_category,
      productName: req.product_name || null,
      plannedQuantity: req.planned_quantity,
      unit: req.unit,
      status: req.status,
      notes: req.notes || null,
    };
    if (req.rate_per_ha) body.ratePerHa = req.rate_per_ha;
    if (req.estimated_unit_price) body.estimatedUnitPrice = req.estimated_unit_price;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/input-requirements`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setRequirements((prev) => prev.map((r) => r.id === data.requirement.id ? data.requirement : r));
          setEditingId(null);
        } else {
          setError(data.error || "Failed to update requirement.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to update requirement.");
      }
    });
  };

  const handleDelete = (reqId: number) => {
    if (!confirm("Delete this input requirement?")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/crop-cycles/${cycleId}/input-requirements`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirementId: reqId }),
        });
        const data = await res.json();
        if (data.ok) {
          setRequirements((prev) => prev.filter((r) => r.id !== reqId));
        } else {
          setError(data.error || "Failed to delete requirement.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete requirement.");
      }
    });
  };

  const resetForm = () => {
    setInputCategory("Seeds");
    setProductName("");
    setPlannedQuantity("");
    setUnit("kg");
    setRatePerHa("");
    setPlannedApplicationDate("");
    setIntendedPurpose("");
    setEstimatedUnitPrice("");
    setNotes("");
  };

  // Calculate totals
  const totalEstimatedCost = requirements.reduce((sum: number, r: any) => {
    return sum + (r.estimated_total_cost || 0);
  }, 0);

  return (
    <Panel title="Input Requirements">
      <div style={{ padding: "var(--space-5)" }}>
        {error && (
          <div style={{ padding: "var(--space-2) var(--space-3)", background: "#faeceb", border: "1px solid #e5b3a8", borderRadius: "var(--radius-sm)", color: "#7a2f24", marginBottom: "var(--space-3)", fontSize: "var(--text-sm)" }}>
            {error}
          </div>
        )}

        {requirements.length > 0 && (
          <div style={{ marginBottom: "var(--space-4)", padding: "var(--space-3) var(--space-4)", background: "var(--surface-page)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)" }}>
            <span style={{ color: "var(--text-muted)" }}>Total estimated cost: </span>
            <span style={{ fontWeight: 700, color: "var(--color-forest)" }}>
              ₹{totalEstimatedCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginLeft: "var(--space-2)" }}>
              (Estimated — not an actual expense)
            </span>
          </div>
        )}

        {requirements.length === 0 && !adding ? (
          <>
            <EmptyState text="No input requirements planned yet. Add seeds, fertilisers, pesticides and other inputs." />
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
              + Add input requirement
            </button>
          </>
        ) : (
          <>
            {/* Requirements table */}
            {requirements.length > 0 && (
              <div style={{ overflowX: "auto", marginBottom: "var(--space-4)" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Rate/ha</th>
                      <th>Est. Cost</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.map((req: any) => (
                      <tr key={req.id}>
                        <td>{req.input_category}</td>
                        <td>{req.product_name || "—"}</td>
                        <td>{req.planned_quantity} {req.unit}</td>
                        <td>{req.rate_per_ha ? `${req.rate_per_ha}/${"ha"}` : "—"}</td>
                        <td>{req.estimated_total_cost ? `₹${req.estimated_total_cost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}</td>
                        <td>{req.planned_application_date ? formatDate(req.planned_application_date) : "—"}</td>
                        <td><span className={badgeClass(req.status)}>{req.status}</span></td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--space-2)" }}>
                            <button
                              onClick={() => setEditingId(req.id)}
                              className={styles.actBtn}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              className={styles.actBtn}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add form */}
            {adding ? (
              <AddRequirementForm
                inputCategory={inputCategory}
                setInputCategory={handleCategoryChange}
                productName={productName}
                setProductName={setProductName}
                plannedQuantity={plannedQuantity}
                setPlannedQuantity={setPlannedQuantity}
                unit={unit}
                setUnit={setUnit}
                ratePerHa={ratePerHa}
                setRatePerHa={setRatePerHa}
                plannedApplicationDate={plannedApplicationDate}
                setPlannedApplicationDate={setPlannedApplicationDate}
                intendedPurpose={intendedPurpose}
                setIntendedPurpose={setIntendedPurpose}
                estimatedUnitPrice={estimatedUnitPrice}
                setEstimatedUnitPrice={setEstimatedUnitPrice}
                notes={notes}
                setNotes={setNotes}
                cultivatedAreaHa={cultivatedAreaHa}
                calculatedQuantity={calculatedQuantity}
                estimatedCost={estimatedCost}
                onAdd={handleAdd}
                onCancel={() => { setAdding(false); resetForm(); setError(""); }}
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
                + Add input requirement
              </button>
            )}

            {/* Edit modal for status */}
            {editingId && (
              <EditRequirementStatus
                req={requirements.find((r: any) => r.id === editingId)!}
                onSave={() => handleUpdate(requirements.find((r: any) => r.id === editingId)!)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

function AddRequirementForm({
  inputCategory, setInputCategory,
  productName, setProductName,
  plannedQuantity, setPlannedQuantity,
  unit, setUnit,
  ratePerHa, setRatePerHa,
  plannedApplicationDate, setPlannedApplicationDate,
  intendedPurpose, setIntendedPurpose,
  estimatedUnitPrice, setEstimatedUnitPrice,
  notes, setNotes,
  cultivatedAreaHa,
  calculatedQuantity,
  estimatedCost,
  onAdd, onCancel, pending,
}: {
  inputCategory: string; setInputCategory: (v: string) => void;
  productName: string; setProductName: (v: string) => void;
  plannedQuantity: string; setPlannedQuantity: (v: string) => void;
  unit: string; setUnit: (v: string) => void;
  ratePerHa: string; setRatePerHa: (v: string) => void;
  plannedApplicationDate: string; setPlannedApplicationDate: (v: string) => void;
  intendedPurpose: string; setIntendedPurpose: (v: string) => void;
  estimatedUnitPrice: string; setEstimatedUnitPrice: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
  cultivatedAreaHa: number;
  calculatedQuantity: string | null;
  estimatedCost: string | null;
  onAdd: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const availableUnits = UNITS[inputCategory] || ["kg"];

  return (
    <div style={{
      padding: "var(--space-4)",
      background: "var(--surface-page)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--line)",
      display: "grid",
      gap: "var(--space-3)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Category *</span>
          <select
            value={inputCategory}
            onChange={(e) => setInputCategory(e.target.value)}
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          >
            {INPUT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Product Name</span>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Urea 46%"
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Quantity *</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={plannedQuantity}
            onChange={(e) => setPlannedQuantity(e.target.value)}
            placeholder="0"
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>

        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Unit</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          >
            {availableUnits.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Rate per ha (optional)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={ratePerHa}
            onChange={(e) => setRatePerHa(e.target.value)}
            placeholder="0"
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>
      </div>

      {calculatedQuantity && cultivatedAreaHa > 0 && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", padding: "var(--space-1) 0" }}>
          Calculated: {ratePerHa} × {cultivatedAreaHa} ha = <strong>{calculatedQuantity} {unit}</strong>
          {" "}
          <button
            onClick={() => setPlannedQuantity(calculatedQuantity!)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-green)",
              cursor: "pointer",
              font: "inherit",
              fontSize: "var(--text-xs)",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Use this quantity
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Application Date</span>
          <input
            type="date"
            value={plannedApplicationDate}
            onChange={(e) => setPlannedApplicationDate(e.target.value)}
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>

        <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          <span>Est. Unit Price (₹, optional)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={estimatedUnitPrice}
            onChange={(e) => setEstimatedUnitPrice(e.target.value)}
            placeholder="0.00"
            style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
          />
        </label>
      </div>

      {estimatedCost && (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", padding: "var(--space-1) 0" }}>
          Estimated cost: {plannedQuantity} × ₹{estimatedUnitPrice} = <strong>₹{parseFloat(estimatedCost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          {" "}
          <span style={{ color: "#7a5a2b" }}>(Estimated — not an actual expense)</span>
        </div>
      )}

      <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <span>Purpose (optional)</span>
        <input
          type="text"
          value={intendedPurpose}
          onChange={(e) => setIntendedPurpose(e.target.value)}
          placeholder="e.g., Basal application"
          style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
        />
      </label>

      <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <span>Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional notes..."
          style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)", resize: "vertical" }}
        />
      </label>

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <button
          onClick={onAdd}
          disabled={pending || !plannedQuantity || parseFloat(plannedQuantity) <= 0}
          style={{
            padding: "0.55rem 1.25rem",
            border: "none",
            background: (pending || !plannedQuantity || parseFloat(plannedQuantity) <= 0) ? "var(--line)" : "var(--color-green)",
            color: "#fff",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: pending ? "default" : "pointer",
          }}
        >
          {pending ? "Adding..." : "Add requirement"}
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

function EditRequirementStatus({ req, onSave, onCancel }: {
  req: any;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      padding: "var(--space-3) var(--space-4)",
      background: "var(--surface-page)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--color-green)",
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "center",
      marginTop: "var(--space-2)",
    }}>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, flex: 1 }}>
        {req.product_name || req.input_category}
      </span>
      <select
        value={req.status}
        onChange={(e) => { req.status = e.target.value; }}
        style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-xs)" }}
      >
        <option value="draft">Draft</option>
        <option value="planned">Planned</option>
        <option value="approved">Approved</option>
        <option value="procurement">Sent for procurement</option>
        <option value="fulfilled">Fulfilled</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button onClick={onSave} className={styles.actBtnAccept}>Save</button>
      <button onClick={onCancel} className={styles.actBtn}>Cancel</button>
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
