import { withAuth, withAuthAndSanitize, badRequest } from "@/lib/api";
import { NextResponse } from "next/server";
import {
  listProcurementOrdersService,
  createProcurementOrderService,
} from "@/lib/services/inputSupply";

export const GET = withAuth({}, async (ctx) => {
  const orders = listProcurementOrdersService(ctx.user.id);
  return NextResponse.json({ orders });
});

export const POST = withAuthAndSanitize(
  { role: "operations" },
  [
    { name: "supplierId", type: "integer", required: true, min: 1 },
    { name: "farmId", type: "integer", min: 1 },
    { name: "cropCycleId", type: "integer", min: 1 },
    { name: "expectedDeliveryDate", type: "text", maxLength: 10 },
    { name: "currency", type: "text", maxLength: 10 },
    { name: "deliveryDestination", type: "text", maxLength: 500 },
    { name: "notes", type: "text", maxLength: 2000 },
  ],
  "PROCUREMENT_ORDER_CREATED",
  (ctx) => ({ supplierId: ctx.body.supplierId }),
  async (ctx) => {
    try {
      const result = createProcurementOrderService({
        userId: ctx.user.id,
        supplierId: ctx.body.supplierId as number,
        farmId: ctx.body.farmId as number | null,
        cropCycleId: ctx.body.cropCycleId as number | null,
        expectedDeliveryDate: ctx.body.expectedDeliveryDate as string | null,
        currency: ctx.body.currency as string,
        deliveryDestination: ctx.body.deliveryDestination as string | null,
        notes: ctx.body.notes as string | null,
      });
      return NextResponse.json(result, { status: 201 });
    } catch (e: any) {
      return badRequest(e.message);
    }
  },
);
