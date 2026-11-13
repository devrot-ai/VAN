"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new activity/task. Posts to /api/activities.
 */
export default function AddActivityForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/activities",
    initialValues: { title: "", dueDate: "", category: "" },
    optionalFields: ["dueDate", "category"],
    successMessage: "Activity added.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Activity added.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Task title"
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            maxLength={200}
            placeholder="e.g. Irrigate Riverside"
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
            <option value="">Select category</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Crop care">Crop care</option>
            <option value="Machinery">Machinery</option>
            <option value="Harvest">Harvest</option>
            <option value="Intelligence">Intelligence</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </Select>
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Adding…" : "Add activity"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
