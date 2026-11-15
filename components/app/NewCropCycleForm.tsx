"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Panel, EmptyState } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";

interface Farm { id: number; name: string; }
interface Field { id: number; name: string; farm_id: number | null; area_ha: number; }
interface Assessment { id: number; field_id: number; assessment_type: string; assessment_date: string; status: string; }

export default function NewCropCycleForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();

  // Form state
  const [farmId, setFarmId] = useState<number | null>(null);
  const [fieldId, setFieldId] = useState<number | null>(null);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [cropType, setCropType] = useState("");
  const [variety, setVariety] = useState("");
  const [season, setSeason] = useState("");
  const [cultivatedAreaHa, setCultivatedAreaHa] = useState("");
  const [plannedPlantingDate, setPlannedPlantingDate] = useState("");
  const [plannedHarvestDate, setPlannedHarvestDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data state
  const [farms, setFarms] = useState<Farm[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  // Load farms on mount
  useEffect(() => {
    fetch("/api/farms")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setFarms(data.farms || []);
      })
      .catch(() => {});
  }, []);

  // Load fields when farm changes
  const loadFields = (farmId: number) => {
    setLoading(true);
    fetch(`/api/fields?farmId=${farmId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setFields(data.fields || []);
          setFieldId(null);
          setAssessments([]);
        }
      })
      .finally(() => setLoading(false));
  };

  // Load assessments when field changes
  const loadAssessments = (fieldId: number) => {
    setLoading(true);
    fetch(`/api/assessments?fieldId=${fieldId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setAssessments(data.assessments || []);
          setAssessmentId(null);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleFarmChange = (id: number) => {
    setFarmId(id);
    setFieldId(null);
    setAssessments([]);
    setSelectedField(null);
    loadFields(id);
  };

  const handleFieldChange = (id: number) => {
    setFieldId(id);
    const field = fields.find((f) => f.id === id);
    setSelectedField(field || null);
    setAssessmentId(null);
    if (id) loadAssessments(id);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return farmId !== null && fieldId !== null;
      case 2: return true;
      case 3: return cropType.trim() !== "";
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (plannedPlantingDate && plannedHarvestDate) {
      if (plannedHarvestDate < plannedPlantingDate) {
        setError("Harvest date cannot be before planting date.");
        return;
      }
    }

    if (cultivatedAreaHa && selectedField) {
      const area = parseFloat(cultivatedAreaHa);
      if (area > selectedField.area_ha) {
        setError(`Cultivated area (${area} ha) exceeds field area (${selectedField.area_ha} ha).`);
        return;
      }
    }

    const body: any = {
      fieldId,
      cropType: cropType.trim(),
      variety: variety.trim() || null,
      season: season.trim() || null,
      notes: notes.trim() || null,
    };
    if (assessmentId) body.assessmentId = assessmentId;
    if (cultivatedAreaHa) body.cultivatedAreaHa = parseFloat(cultivatedAreaHa);
    if (plannedPlantingDate) body.plannedPlantingDate = plannedPlantingDate;
    if (plannedHarvestDate) body.plannedHarvestDate = plannedHarvestDate;

    startTransition(async () => {
      try {
        const res = await fetch("/api/crop-cycles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.ok) {
          setSuccess("Crop cycle created successfully.");
          setTimeout(() => router.push(`/app/crop-planning/${data.cycle.id}`), 500);
        } else {
          setError(data.error || "Failed to create crop cycle.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to create crop cycle.");
      }
    });
  };

  const steps = [
    { num: 1, label: "Farm & Field" },
    { num: 2, label: "Assessment" },
    { num: 3, label: "Crop Info" },
    { num: 4, label: "Area" },
    { num: 5, label: "Dates" },
    { num: 6, label: "Review" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Crop Planning"
        title="Create new crop cycle"
        lead="Follow the steps below to set up a new crop cycle for your field."
      />

      {/* Step indicator */}
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-6)", flexWrap: "wrap" }}>
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            disabled={s.num > step}
            style={{
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: s.num === step ? "2px solid var(--color-green)" : "1px solid var(--line)",
              background: s.num === step ? "var(--color-green)" : s.num < step ? "var(--surface-raise)" : "var(--surface-page)",
              color: s.num === step ? "#fff" : s.num < step ? "var(--text-strong)" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              cursor: s.num > step ? "default" : "pointer",
              opacity: s.num > step ? 0.5 : 1,
            }}
          >
            {s.num}. {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "var(--space-3) var(--space-4)", background: "#faeceb", border: "1px solid #e5b3a8", borderRadius: "var(--radius-sm)", color: "#7a2f24", marginBottom: "var(--space-4)", fontSize: "var(--text-sm)" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "var(--space-3) var(--space-4)", background: "#e8f0e4", border: "1px solid #c9dcc1", borderRadius: "var(--radius-sm)", color: "#2a5c41", marginBottom: "var(--space-4)", fontSize: "var(--text-sm)" }}>
          {success}
        </div>
      )}

      <Panel title={steps[step - 1]?.label || ""}>
        <div style={{ padding: "var(--space-5)", maxWidth: 600 }}>

          {step === 1 && (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Farm *</span>
                <select
                  value={farmId || ""}
                  onChange={(e) => handleFarmChange(Number(e.target.value))}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                >
                  <option value="">Select a farm...</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </label>

              {farmId && (
                <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <span>Field *</span>
                  {loading ? (
                    <div style={{ padding: "var(--space-3)", color: "var(--text-muted)" }}>Loading fields...</div>
                  ) : (
                    <select
                      value={fieldId || ""}
                      onChange={(e) => handleFieldChange(Number(e.target.value))}
                      style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                    >
                      <option value="">Select a field...</option>
                      {fields.map((f) => (
                        <option key={f.id} value={f.id}>{f.name} ({f.area_ha} ha)</option>
                      ))}
                    </select>
                  )}
                </label>
              )}

              {selectedField && (
                <div style={{ padding: "var(--space-3)", background: "var(--surface-page)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <strong>{selectedField.name}</strong> — {selectedField.area_ha} ha
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                Link an approved land assessment for this field. This is optional but recommended for informed crop planning.
              </p>
              {assessments.length === 0 ? (
                <EmptyState text="No assessments found for this field. You can proceed without one." />
              ) : (
                <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <span>Land Assessment (optional)</span>
                  <select
                    value={assessmentId || ""}
                    onChange={(e) => setAssessmentId(Number(e.target.value) || null)}
                    style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                  >
                    <option value="">No assessment</option>
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assessment_type} — {a.assessment_date} ({a.status})
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Crop *</span>
                <input
                  type="text"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g., Wheat, Rice, Cotton"
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                />
              </label>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Variety (optional)</span>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g., PBW 343"
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                />
              </label>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Season (optional)</span>
                <input
                  type="text"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g., Kharif 2025, Rabi 2025"
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                {selectedField ? `Field area: ${selectedField.area_ha} ha` : "Select a field to see its area."}
              </p>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Cultivated Area (hectares, optional)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedField?.area_ha || ""}
                  value={cultivatedAreaHa}
                  onChange={(e) => setCultivatedAreaHa(e.target.value)}
                  placeholder={selectedField ? String(selectedField.area_ha) : "0.00"}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                />
              </label>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Planting Date (optional)</span>
                <input
                  type="date"
                  value={plannedPlantingDate}
                  onChange={(e) => setPlannedPlantingDate(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                />
              </label>
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Expected Harvest Date (optional)</span>
                <input
                  type="date"
                  value={plannedHarvestDate}
                  onChange={(e) => setPlannedHarvestDate(e.target.value)}
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)" }}
                />
              </label>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <ReviewSummary
                farm={farms.find((f) => f.id === farmId)}
                field={selectedField}
                assessment={assessments.find((a) => a.id === assessmentId)}
                cropType={cropType}
                variety={variety}
                season={season}
                cultivatedAreaHa={cultivatedAreaHa}
                plannedPlantingDate={plannedPlantingDate}
                plannedHarvestDate={plannedHarvestDate}
              />
              <label style={{ display: "grid", gap: "var(--space-1)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                <span>Notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes about this crop cycle..."
                  style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", font: "inherit", fontSize: "var(--text-sm)", resize: "vertical" }}
                />
              </label>
            </div>
          )}
        </div>
      </Panel>

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-4)" }}>
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          style={{
            padding: "0.55rem 1.25rem",
            border: "1px solid var(--line)",
            background: "var(--surface-page)",
            borderRadius: "var(--radius-sm)",
            font: "inherit",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: step === 1 ? "default" : "pointer",
            opacity: step === 1 ? 0.5 : 1,
          }}
        >
          ← Previous
        </button>

        {step < 6 ? (
          <button
            onClick={() => setStep((s) => Math.min(6, s + 1))}
            disabled={!canProceed()}
            style={{
              padding: "0.55rem 1.25rem",
              border: "none",
              background: canProceed() ? "var(--color-green)" : "var(--line)",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              font: "inherit",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: canProceed() ? "pointer" : "default",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={pending || !canProceed()}
            style={{
              padding: "0.55rem 1.25rem",
              border: "none",
              background: (pending || !canProceed()) ? "var(--line)" : "var(--color-green)",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              font: "inherit",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: pending ? "default" : "pointer",
            }}
          >
            {pending ? "Creating..." : "Create crop cycle"}
          </button>
        )}
      </div>
    </>
  );
}

function ReviewSummary({ farm, field, assessment, cropType, variety, season, cultivatedAreaHa, plannedPlantingDate, plannedHarvestDate }: {
  farm?: Farm;
  field?: Field | null;
  assessment?: Assessment;
  cropType: string;
  variety: string;
  season: string;
  cultivatedAreaHa: string;
  plannedPlantingDate: string;
  plannedHarvestDate: string;
}) {
  const rows = [
    { label: "Farm", value: farm?.name || "—" },
    { label: "Field", value: field?.name || "—" },
    { label: "Assessment", value: assessment ? `${assessment.assessment_type} (${assessment.status})` : "None selected" },
    { label: "Crop", value: cropType || "—" },
    { label: "Variety", value: variety || "—" },
    { label: "Season", value: season || "—" },
    { label: "Cultivated Area", value: cultivatedAreaHa ? `${cultivatedAreaHa} ha` : "—" },
    { label: "Planting Date", value: plannedPlantingDate ? formatDate(plannedPlantingDate) : "—" },
    { label: "Harvest Date", value: plannedHarvestDate ? formatDate(plannedHarvestDate) : "—" },
  ];

  return (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", padding: "var(--space-2) 0", borderBottom: "1px solid var(--line)" }}>
          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{r.label}</span>
          <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}
