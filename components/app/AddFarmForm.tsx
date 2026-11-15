"use client";

import { useForm } from "@/lib/useForm";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new farm. Posts to /api/farms.
 */
export default function AddFarmForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/farms",
    initialValues: { name: "", address: "", totalAreaHa: "", status: "active" },
    optionalFields: ["address"],
    successMessage: "Farm created.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Farm created.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Farm name"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            maxLength={200}
            placeholder="e.g. Green Valley Farm"
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            maxLength={500}
            placeholder="Village, District, State"
          />
          <Input
            label="Total area (hectares)"
            type="number"
            required
            min="0.01"
            step="0.1"
            value={form.totalAreaHa}
            onChange={(e) => setField("totalAreaHa", e.target.value)}
            placeholder="e.g. 50"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </Select>
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Creating…" : "Create farm"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
