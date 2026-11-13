"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Booking request form for one equipment listing.
 * Posts to /api/bookings, which creates the linked farmer/provider pair.
 */
export default function BookingRequestForm({ equipmentId }: { equipmentId: number }) {
  const [whenDate, setWhenDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipmentId, whenDate, endDate, note }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || "Could not send the request.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2 text-sm">
            <strong>Request sent.</strong>
            <p className="text-muted-foreground">
              The owner will accept or decline. You can follow the decision under
              "Your bookings".
            </p>
            <Link href="/app/machinery" className="text-primary font-medium hover:underline">
              Back to marketplace
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Start date"
            type="date"
            required
            value={whenDate}
            onChange={(e) => setWhenDate(e.target.value)}
          />
          <Input
            label="End date (optional)"
            type="date"
            min={whenDate || undefined}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Textarea
            label="Scope of work (optional)"
            rows={3}
            placeholder="e.g. Ploughing North Field, approx. 40 ha"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Sending request…" : "Send request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
