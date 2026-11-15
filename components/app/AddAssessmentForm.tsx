"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@/lib/useForm";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface AddAssessmentFormProps {
  fields: Array<{ id: number; name: string }>;
}

/**
 * Create a new land assessment. Posts to /api/assessments.
 */
export default function AddAssessmentForm({ fields }: AddAssessmentFormProps) {
  const router = useRouter();
  const { form, setField, error, saved, loading, onSubmit, dropdownItems, dropdownLoading, dropdownEmpty } = useForm({
    endpoint: "/api/assessments",
    initialValues: { fieldId: "", assessmentType: "", assessor: "", dataSource: "", assessmentDate: "", observations: "" },
    optionalFields: ["assessor", "dataSource", "assessmentDate", "observations"],
    successMessage: "Assessment created.",
  });

  // Pre-populate fields dropdown if provided
  const fieldOptions = fields.length > 0 ? fields : dropdownItems;
  const isLoading = fields.length > 0 ? false : dropdownLoading;
  const isEmpty = fields.length > 0 ? false : dropdownEmpty;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Assessment created.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium mb-1.5">Field <span className="text-red-500">*</span></label>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading fields…</p>
            ) : isEmpty ? (
              <p className="text-sm text-amber-600">No fields available. Create a field first.</p>
            ) : (
              <select
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#728B51] focus:ring-1 focus:ring-[#728B51]"
                value={form.fieldId}
                onChange={(e) => setField("fieldId", e.target.value)}
              >
                <option value="">Select a field</option>
                {fieldOptions.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
          </div>

          <Select
            label="Assessment type"
            value={form.assessmentType}
            onChange={(e) => setField("assessmentType", e.target.value)}
          >
            <option value="">Select type</option>
            <option value="soil_testing">Soil testing</option>
            <option value="field_inspection">Field inspection</option>
            <option value="drainage_assessment">Drainage assessment</option>
            <option value="irrigation_assessment">Irrigation assessment</option>
            <option value="crop_suitability">Crop suitability</option>
            <option value="follow_up">Follow-up assessment</option>
          </Select>

          <Input
            label="Assessor"
            value={form.assessor}
            onChange={(e) => setField("assessor", e.target.value)}
            maxLength={200}
            placeholder="e.g. Dr. Sharma"
          />

          <Input
            label="Data source"
            value={form.dataSource}
            onChange={(e) => setField("dataSource", e.target.value)}
            maxLength={200}
            placeholder="e.g. State Agri Lab"
          />

          <Input
            label="Assessment date"
            type="date"
            value={form.assessmentDate}
            onChange={(e) => setField("assessmentDate", e.target.value)}
          />

          <Textarea
            label="Observations"
            rows={3}
            value={form.observations}
            onChange={(e) => setField("observations", e.target.value)}
            maxLength={5000}
            placeholder="Initial field observations…"
          />

          <Button type="submit" disabled={loading || isEmpty} className="self-start">
            {loading ? "Creating…" : "Create assessment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
