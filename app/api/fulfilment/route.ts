import { withAuthAndSanitize, badRequest } from "@/lib/api";
import { NextResponse } from "next/server";
import { allocateStockToFulfilmentService } from "@/lib/services/inputSupply";

export const POST = withAuthAndSanitize(
  { role: "operations" },
  [
    { name: "requestId", type: "integer", required: true, min: 1 },
    { name: "inputId", type: "integer", required: true, min: 1 },
    { name: "inventoryId", type: "integer", required: true, min: 1 },
    { name: "farmId", type: "integer", required: true, min: 1 },
    { name: "quantity", type: "number", required: true, min: 0.001 },
    { name: "unit", type: "text", required: true, maxLength: 50 },
    { name: "requestItemId", type: "integer", min: 1 },
    { name: "batchNumber", type: "text", maxLength: 100 },
  ],
  "FULFILMENT_ALLOCATED",
  (ctx) => ({ requestId: ctx.body.requestId }),
  async (ctx) => {
    try {
      const record = allocateStockToFulfilmentService({
        userId: ctx.user.id,
        requestId: ctx.body.requestId as number,
        inputId: ctx.body.inputId as number,
        inventoryId: ctx.body.inventoryId as number,
        farmId: ctx.body.farmId as number,
        quantity: ctx.body.quantity as number,
        unit: ctx.body.unit as string,
        requestItemId: ctx.body.requestItemId as number | null,
        batchNumber: ctx.body.batchNumber as string | null,
      });
      return NextResponse.json({ fulfilment: record }, { status: 201 });
    } catch (e: any) {
      return badRequest(e.message);
    }
  },
);
