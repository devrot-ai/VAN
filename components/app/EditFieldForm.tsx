"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Inline edit form for a field record.
 * Called with the current field data and a cancel callback.
 */
export default function EditFieldForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { name: string; areaHa: number; crop: string; status: string; notes: string };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/fields",
    method: "PUT",
    id,
    initialValues: {
      name: initial.name,
      areaHa: String(initial.areaHa),
      crop: initial.crop,
      status: initial.status,
      notes: initial.notes,
    },
    optionalFields: ["crop", "status", "notes"],
    successMessage: "Field updated.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Field updated.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Field name"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            maxLength={120}
          />
          <Input
            label="Area (hectares)"
            required
            type="number"
            step="0.01"
            min="0.01"
            value={form.areaHa}
            onChange={(e) => setField("areaHa", e.target.value)}
          />
          <Input
            label="Crop"
            value={form.crop}
            onChange={(e) => setField("crop", e.target.value)}
            maxLength={100}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="">—</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="ready">Ready</option>
            <option value="harvested">Harvested</option>
            <option value="fallow">Fallow</option>
          </Select>
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
