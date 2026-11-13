"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new equipment listing. Posts to /api/equipment.
 */
export default function AddEquipmentForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/equipment",
    initialValues: { name: "", category: "", dailyRate: "", location: "" },
    optionalFields: ["category", "dailyRate", "location"],
    successMessage: "Equipment listed.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Equipment listed.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Equipment name"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            maxLength={120}
            placeholder="e.g. Tractor — 120 HP"
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
          >
            <option value="">Select category</option>
            <option value="tractor">Tractor</option>
            <option value="implements">Implements</option>
            <option value="trailer">Trailer</option>
            <option value="harvester">Harvester</option>
            <option value="irrigation">Irrigation</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Daily rate ($)"
            type="number"
            min="0"
            step="10"
            value={form.dailyRate}
            onChange={(e) => setField("dailyRate", e.target.value)}
            placeholder="e.g. 380"
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            maxLength={120}
            placeholder="e.g. Riverside depot"
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Listing…" : "List equipment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
