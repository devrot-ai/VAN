"use client";

import { useForm } from "@/lib/useForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Add a new purchase enquiry. Posts to /api/purchases.
 * Maps form fields to purchase API fields (seller → buyer, adds status: "enquiry").
 */
export default function AddEnquiryForm() {
  const { form, setField, error, saved, loading, onSubmit } = useForm({
    endpoint: "/api/purchases",
    initialValues: { lot: "", seller: "", quantityTonnes: "", amount: "", notes: "" },
    optionalFields: ["seller", "amount", "notes"],
    successMessage: "Enquiry created.",
    errorMessage: "Could not create enquiry.",
    transformPayload: (payload) => ({
      lot: payload.lot,
      buyer: payload.seller || undefined,
      quantityTonnes: Number(payload.quantityTonnes),
      amount: payload.amount ? Number(payload.amount) : undefined,
      status: "enquiry",
      notes: payload.notes || undefined,
    }),
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {saved ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
              Enquiry created.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}
          <Input
            label="Lot / Crop"
            required
            value={form.lot}
            onChange={(e) => setField("lot", e.target.value)}
            maxLength={100}
            placeholder="e.g. Winter wheat, Summer corn"
          />
          <Input
            label="Seller / Farm"
            value={form.seller}
            onChange={(e) => setField("seller", e.target.value)}
            maxLength={100}
            placeholder="e.g. Green Valley Farm"
          />
          <Input
            label="Quantity (tonnes)"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.quantityTonnes}
            onChange={(e) => setField("quantityTonnes", e.target.value)}
            placeholder="e.g. 20"
          />
          <Input
            label="Estimated amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setField("amount", e.target.value)}
            placeholder="e.g. 5000"
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            maxLength={300}
            placeholder="Additional details…"
          />
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Creating…" : "Create enquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
