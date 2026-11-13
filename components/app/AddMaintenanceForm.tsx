"use client";

import { useForm } from "@/lib/useForm";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new maintenance record linked to equipment. Posts to /api/maintenance.
 * Fetches equipment list from /api/equipment for the dropdown.
 */
export default function AddMaintenanceForm() {
  const { form, setField, error, saved, loading, onSubmit, dropdownItems, dropdownEmpty } = useForm({
    endpoint: "/api/maintenance",
    initialValues: { equipmentId: "", task: "", dueDate: "", status: "scheduled", notes: "" },
    optionalFields: ["dueDate", "notes"],
    successMessage: "Maintenance record added.",
    errorMessage: "Could not add maintenance record.",
    dropdownFetch: { url: "/api/equipment", key: "equipment", valueField: "id", labelField: "name" },
    transformPayload: (payload) => ({
      ...payload,
      equipmentId: Number(payload.equipmentId),
    }),
  });

  if (dropdownEmpty) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Add equipment first before creating maintenance records.
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
              Maintenance record added.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Select
            label="Equipment"
            required
            value={form.equipmentId}
            onChange={(e) => setField("equipmentId", e.target.value)}
          >
            <option value="">Select equipment</option>
            {dropdownItems.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </Select>
          <Input
            label="Task"
            required
            value={form.task}
            onChange={(e) => setField("task", e.target.value)}
            maxLength={200}
            placeholder="e.g. Oil & filter change"
          />
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
          <Textarea
            label="Notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            maxLength={500}
            placeholder="Parts needed, service interval, etc."
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Adding…" : "Add maintenance record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
