"use client";

import { useForm } from "@/lib/useForm";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new field to the farm. Posts to /api/fields.
 */
export default function AddFieldForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/fields",
    initialValues: { name: "", areaHa: "", crop: "", status: "", notes: "" },
    optionalFields: ["crop", "status", "notes"],
    successMessage: "Field added.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Field added.
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
            placeholder="e.g. North Field"
          />
          <Input
            label="Area (hectares)"
            type="number"
            required
            min="0.01"
            step="0.1"
            value={form.areaHa}
            onChange={(e) => setField("areaHa", e.target.value)}
            placeholder="e.g. 42"
          />
          <Input
            label="Crop"
            value={form.crop}
            onChange={(e) => setField("crop", e.target.value)}
            maxLength={120}
            placeholder="e.g. Winter wheat"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="">Select status</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="harvesting">Harvesting</option>
            <option value="fallow">Fallow</option>
          </Select>
          <Textarea
            label="Notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            maxLength={500}
            placeholder="Soil type, drainage, etc."
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Adding…" : "Add field"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
