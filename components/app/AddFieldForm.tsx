"use client";

import { useForm } from "@/lib/useForm";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface AddFieldFormProps {
  /** Optional: pre-selected farm ID to auto-fill the farm dropdown */
  farmId?: number;
}

/**
 * Add a new field. Posts to /api/fields.
 * Supports optional farm association via farmId.
 */
export default function AddFieldForm({ farmId }: AddFieldFormProps = {}) {
  const { form, setField, error, saved, loading, onSubmit, dropdownItems, dropdownLoading, dropdownEmpty } = useForm({
    endpoint: "/api/fields",
    initialValues: { name: "", areaHa: "", farmId: farmId ? String(farmId) : "", crop: "", status: "", notes: "" },
    optionalFields: ["farmId", "crop", "status", "notes"],
    successMessage: "Field added.",
    dropdownFetch: { url: "/api/farms", key: "farms", valueField: "id", labelField: "name" },
  });

  // If farmId prop is provided, use it to pre-select; otherwise use dropdown
  const farmOptions = farmId
    ? [{ id: farmId, name: "" }] // will be set by server
    : dropdownItems;

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
          {!farmId && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Farm</label>
              {dropdownLoading ? (
                <p className="text-sm text-gray-500">Loading farms…</p>
              ) : dropdownEmpty ? (
                <p className="text-sm text-amber-600">No farms found. Create a farm first.</p>
              ) : (
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#728B51] focus:ring-1 focus:ring-[#728B51]"
                  value={form.farmId}
                  onChange={(e) => setField("farmId", e.target.value)}
                >
                  <option value="">No farm (unassigned)</option>
                  {farmOptions.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          {farmId && <input type="hidden" name="farmId" value={form.farmId} />}
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
