"use client";

import { useForm } from "@/lib/useForm";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Register a new device. Posts to /api/devices.
 */
export default function AddDeviceForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/devices",
    initialValues: { name: "", kind: "", status: "offline", location: "" },
    optionalFields: ["location"],
    successMessage: "Device registered.",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Device registered.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Device name"
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            maxLength={120}
            placeholder="e.g. Weather station — North"
          />
          <Select
            label="Type"
            required
            value={form.kind}
            onChange={(e) => setField("kind", e.target.value)}
          >
            <option value="">Select type</option>
            <option value="weather">Weather station</option>
            <option value="sensor">Sensor</option>
            <option value="hub">Hub</option>
            <option value="machine">Machine controller</option>
            <option value="camera">Camera</option>
            <option value="other">Other</option>
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="maintenance">Maintenance</option>
          </Select>
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setField("location", e.target.value)}
            maxLength={120}
            placeholder="e.g. North Field"
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Registering…" : "Register device"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
