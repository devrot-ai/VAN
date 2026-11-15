import { withAuth, withAuthAndSanitize, badRequest } from "@/lib/api";
import { NextResponse } from "next/server";
import {
  listInputCatalogueService,
  createInputCatalogueService,
} from "@/lib/services/inputSupply";

export const GET = withAuth({}, async () => {
  const inputs = listInputCatalogueService();
  return NextResponse.json({ inputs });
});

export const POST = withAuthAndSanitize(
  { role: "operations" },
  [
    { name: "name", type: "text", required: true, maxLength: 200 },
    { name: "category", type: "text", required: true, maxLength: 100 },
    { name: "unit", type: "text", required: true, maxLength: 50 },
    { name: "manufacturer", type: "text", maxLength: 200 },
    { name: "brand", type: "text", maxLength: 100 },
    { name: "sku", type: "text", maxLength: 100 },
    { name: "description", type: "text", maxLength: 2000 },
    { name: "packageSize", type: "number", min: 0.001 },
    { name: "unitPrice", type: "number", min: 0 },
    { name: "storageConditions", type: "text", maxLength: 500 },
  ],
  "INPUT_CATALOGUE_CREATED",
  (ctx) => ({ name: ctx.body.name }),
  async (ctx) => {
    try {
      const row = createInputCatalogueService({
        name: ctx.body.name as string,
        category: ctx.body.category as string,
        unit: ctx.body.unit as string,
        manufacturer: ctx.body.manufacturer as string | null,
        brand: ctx.body.brand as string | null,
        sku: ctx.body.sku as string | null,
        description: ctx.body.description as string | null,
        packageSize: ctx.body.packageSize as number | null,
        unitPrice: ctx.body.unitPrice as number | null,
        storageConditions: ctx.body.storageConditions as string | null,
      });
      return NextResponse.json({ input: row }, { status: 201 });
    } catch (e: any) {
      return badRequest(e.message);
    }
  },
);
