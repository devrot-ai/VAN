"use client";

import { useForm } from "@/lib/useForm";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Edit an existing farm. PUTs to /api/farms.
 * Ownership (user_id) cannot be changed through this form.
 */
export default function EditFarmForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { name: string; address: string; totalAreaHa: number; status: string };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/farms",
    method: "PUT",
    id,
    initialValues: {
      name: initial.name,
      address: initial.address ?? "",
      totalAreaHa: String(initial.totalAreaHa),
      status: initial.status ?? "active",
    },
    optionalFields: ["address"],
    successMessage: "Farm updated.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Farm updated.
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
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            maxLength={500}
          />
          <Input
            label="Total area (hectares)"
            type="number"
            required
            min="0.01"
            step="0.1"
            value={form.totalAreaHa}
            onChange={(e) => setField("totalAreaHa", e.target.value)}
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
