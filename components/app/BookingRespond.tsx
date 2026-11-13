"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Provider-side booking decision. Posts to /api/bookings/respond; the server
 * validates ownership and status, then keeps the farmer-side booking in sync.
 */
export default function BookingRespond({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "accept" | "decline">(null);
  const [error, setError] = useState("");

  async function respond(action: "accept" | "decline") {
    setError("");
    setBusy(action);
    try {
      const res = await fetch("/api/bookings/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error || "Could not update the request.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="default"
        size="sm"
        disabled={busy !== null}
        onClick={() => respond("accept")}
      >
        {busy === "accept" ? "Accepting…" : "Accept"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={() => respond("decline")}
      >
        {busy === "decline" ? "Declining…" : "Decline"}
      </Button>
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </span>
  );
}
