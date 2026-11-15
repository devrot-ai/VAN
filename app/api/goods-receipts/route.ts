import { withAuthAndSanitize, badRequest } from "@/lib/api";
import { NextResponse } from "next/server";
import { createGoodsReceiptService } from "@/lib/services/inputSupply";

export const POST = withAuthAndSanitize(
  { role: "operations" },
  [
    { name: "procurementOrderId", type: "integer", required: true, min: 1 },
    { name: "receiptDate", type: "text", maxLength: 10 },
    { name: "receivingLocation", type: "text", maxLength: 300 },
    { name: "deliveryReference", type: "text", maxLength: 200 },
    { name: "batchNumber", type: "text", maxLength: 100 },
    { name: "expiryDate", type: "text", maxLength: 10 },
    { name: "inspectionNotes", type: "text", maxLength: 2000 },
  ],
  "GOODS_RECEIPT_CREATED",
  (ctx) => ({ procurementOrderId: ctx.body.procurementOrderId }),
  async (ctx) => {
    try {
      const body = ctx.body;
      const items = (body.items as Array<{
        orderItemId: number;
        receivedQuantity: number;
        acceptedQuantity: number;
        rejectedQuantity?: number;
        damagedQuantity?: number;
        unit: string;
        notes?: string;
      }>) || [];

      const result = createGoodsReceiptService({
        userId: ctx.user.id,
        procurementOrderId: body.procurementOrderId as number,
        receiptDate: body.receiptDate as string | undefined,
        receivingLocation: body.receivingLocation as string | null,
        deliveryReference: body.deliveryReference as string | null,
        batchNumber: body.batchNumber as string | null,
        expiryDate: body.expiryDate as string | null,
        inspectionNotes: body.inspectionNotes as string | null,
        items,
      });
      return NextResponse.json(result, { status: 201 });
    } catch (e: any) {
      return badRequest(e.message);
    }
  },
);
