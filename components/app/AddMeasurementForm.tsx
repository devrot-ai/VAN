"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface AddMeasurementFormProps {
  assessmentId: number;
}

const MEASUREMENT_TYPES = [
  { value: "pH", label: "pH", unit: "pH" },
  { value: "organic_carbon", label: "Organic Carbon", unit: "%" },
  { value: "nitrogen", label: "Nitrogen (N)", unit: "kg/ha" },
  { value: "phosphorus", label: "Phosphorus (P)", unit: "kg/ha" },
  { value: "potassium", label: "Potassium (K)", unit: "kg/ha" },
  { value: "moisture", label: "Moisture", unit: "%" },
  { value: "electrical_conductivity", label: "Electrical Conductivity", unit: "dS/m" },
  { value: "texture", label: "Soil Texture", unit: "classification" },
];

export default function AddMeasurementForm({ assessmentId }: AddMeasurementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    measurementType: "",
    value: "",
    unit: "",
    sampleId: "",
    method: "",
    source: "",
    referenceRangeMin: "",
    referenceRangeMax: "",
  });

  const handleTypeChange = (type: string) => {
    const typeInfo = MEASUREMENT_TYPES.find((t) => t.value === type);
    setForm((f) => ({ ...f, measurementType: type, unit: typeInfo?.unit || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);

    const payload: Record<string, unknown> = {
      assessmentId,
      measurementType: form.measurementType,
      value: Number(form.value),
      unit: form.unit,
    };
    if (form.sampleId) payload.sampleId = form.sampleId;
    if (form.method) payload.method = form.method;
    if (form.source) payload.source = form.source;
    if (form.referenceRangeMin) payload.referenceRangeMin = Number(form.referenceRangeMin);
    if (form.referenceRangeMax) payload.referenceRangeMax = Number(form.referenceRangeMax);

    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add measurement");
      setSaved(true);
      setForm({
        measurementType: "",
        value: "",
        unit: "",
        sampleId: "",
        method: "",
        source: "",
        referenceRangeMin: "",
        referenceRangeMax: "",
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {saved && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Measurement added.
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Select
            label="Measurement type"
            value={form.measurementType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">Select type</option>
            {MEASUREMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>

          <Input
            label="Value"
            type="number"
            step="any"
            required
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder="e.g. 6.5"
          />

          <Input
            label="Unit"
            required
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="e.g. pH"
          />

          <Input
            label="Sample ID"
            value={form.sampleId}
            onChange={(e) => setForm((f) => ({ ...f, sampleId: e.target.value }))}
            placeholder="e.g. S-001"
          />

          <Input
            label="Method"
            value={form.method}
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
            placeholder="e.g. Lab analysis"
          />

          <Input
            label="Source"
            value={form.source}
            onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
            placeholder="e.g. State Agri Lab"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reference min"
              type="number"
              step="any"
              value={form.referenceRangeMin}
              onChange={(e) => setForm((f) => ({ ...f, referenceRangeMin: e.target.value }))}
              placeholder="Min"
            />
            <Input
              label="Reference max"
              type="number"
              step="any"
              value={form.referenceRangeMax}
              onChange={(e) => setForm((f) => ({ ...f, referenceRangeMax: e.target.value }))}
              placeholder="Max"
            />
          </div>

          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Adding…" : "Add measurement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
