"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Inline edit form for an activity record.
 */
export default function EditActivityForm({
  id,
  initial,
  onCancel,
}: {
  id: number;
  initial: { title: string; dueDate: string; category: string; done: number };
  onCancel: () => void;
}) {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/activities",
    method: "PUT",
    id,
    initialValues: {
      title: initial.title,
      dueDate: initial.dueDate,
      category: initial.category,
      done: initial.done ? "on" : "",
    },
    optionalFields: ["dueDate", "category"],
    transformPayload: (p) => ({ ...p, done: Boolean(p.done) }),
    successMessage: "Activity updated.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Activity updated.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            maxLength={200}
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
          >
            <option value="">—</option>
            <option value="planting">Planting</option>
            <option value="irrigation">Irrigation</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="pest-control">Pest control</option>
            <option value="harvest">Harvest</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded border-border"
              checked={Boolean(form.done)}
              onChange={(e) => setField("done", e.target.checked ? "on" : "")}
            />
            Done
          </label>
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
