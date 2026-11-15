import { withAuth, withAuthAndSanitize, badRequest } from "@/lib/api";
import { NextResponse } from "next/server";
import {
  listSuppliersService,
  createSupplierService,
} from "@/lib/services/inputSupply";

export const GET = withAuth({}, async (ctx) => {
  const suppliers = listSuppliersService(ctx.user.id);
  return NextResponse.json({ suppliers });
});

export const POST = withAuthAndSanitize(
  { role: "operations" },
  [
    { name: "name", type: "text", required: true, maxLength: 200 },
    { name: "contactName", type: "text", maxLength: 200 },
    { name: "email", type: "text", maxLength: 200 },
    { name: "phone", type: "text", maxLength: 20 },
    { name: "address", type: "text", maxLength: 500 },
    { name: "supplierType", type: "text", maxLength: 100 },
    { name: "country", type: "text", maxLength: 100 },
    { name: "region", type: "text", maxLength: 100 },
    { name: "terms", type: "text", maxLength: 2000 },
  ],
  "SUPPLIER_CREATED",
  (ctx) => ({ name: ctx.body.name }),
  async (ctx) => {
    try {
      const row = createSupplierService({
        userId: ctx.user.id,
        name: ctx.body.name as string,
        contactName: ctx.body.contactName as string | null,
        email: ctx.body.email as string | null,
        phone: ctx.body.phone as string | null,
        address: ctx.body.address as string | null,
        supplierType: ctx.body.supplierType as string | null,
        country: ctx.body.country as string | null,
        region: ctx.body.region as string | null,
        terms: ctx.body.terms as string | null,
      });
      return NextResponse.json({ supplier: row }, { status: 201 });
    } catch (e: any) {
      return badRequest(e.message);
    }
  },
);
