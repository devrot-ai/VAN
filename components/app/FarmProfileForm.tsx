"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Farm / business profile editor. The location is a plain place name — used
 * for weather lookup and proximity search, never precision geolocation.
 */
export default function FarmProfileForm({
  farmName,
  location,
}: {
  farmName: string;
  location: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ farmName, location });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save your profile.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Profile saved.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Farm name"
            value={form.farmName}
            onChange={(e) => setForm((f) => ({ ...f, farmName: e.target.value }))}
            maxLength={120}
            placeholder="e.g. Morgan Fields Farm"
          />
          <Input
            label="Location (town or district)"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            maxLength={120}
            placeholder="e.g. Uxbridge, United Kingdom"
          />
          <p className="text-xs text-muted-foreground">
            Your location names the area around your farm. VAN uses it to show local
            weather and to rank nearby listings — it is never shared publicly.
          </p>
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
