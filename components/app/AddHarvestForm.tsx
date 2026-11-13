"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new harvest record. Posts to /api/harvests.
 * Fetches field list from /api/fields for the dropdown.
 */
export default function AddHarvestForm() {
  const { form, setField, error, saved, loading, onSubmit, dropdownItems, dropdownEmpty } = useForm({
    endpoint: "/api/harvests",
    initialValues: { fieldId: "", crop: "", quantityTonnes: "", date: "", quality: "", status: "planned" },
    optionalFields: ["quality"],
    successMessage: "Harvest recorded.",
    errorMessage: "Could not add harvest.",
    dropdownFetch: { url: "/api/fields", key: "fields", valueField: "id", labelField: "name" },
    transformPayload: (payload) => ({
      ...payload,
      fieldId: Number(payload.fieldId),
      quantityTonnes: Number(payload.quantityTonnes),
    }),
  });

  if (dropdownEmpty) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Add fields first before recording harvests.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Harvest recorded.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Select
            label="Field"
            required
            value={form.fieldId}
            onChange={(e) => setField("fieldId", e.target.value)}
          >
            <option value="">Select field</option>
            {dropdownItems.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
          <Input
            label="Crop"
            required
            value={form.crop}
            onChange={(e) => setField("crop", e.target.value)}
            maxLength={100}
            placeholder="e.g. Wheat, Corn"
          />
          <Input
            label="Quantity (tonnes)"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.quantityTonnes}
            onChange={(e) => setField("quantityTonnes", e.target.value)}
            placeholder="e.g. 15.5"
          />
          <Input
            label="Harvest date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setField("date", e.target.value)}
          />
          <Input
            label="Quality"
            value={form.quality}
            onChange={(e) => setField("quality", e.target.value)}
            maxLength={60}
            placeholder="e.g. Premium, Standard"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </Select>
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Recording…" : "Record harvest"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
