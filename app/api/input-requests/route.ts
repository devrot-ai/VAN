import { withAuth, withAuthAndSanitize, badRequest } from "@/lib/api";
import { NextResponse } from "next/server";
import {
  listInputSupplyRequestsService,
  createInputSupplyRequestService,
} from "@/lib/services/inputSupply";

export const GET = withAuth({}, async (ctx) => {
  const requests = listInputSupplyRequestsService(ctx.user.id);
  return NextResponse.json({ requests });
});

export const POST = withAuthAndSanitize(
  {},
  [
    { name: "farmId", type: "integer", required: true, min: 1 },
    { name: "cropCycleId", type: "integer", min: 1 },
    { name: "deliveryLocation", type: "text", maxLength: 500 },
    { name: "requestedDate", type: "text", maxLength: 10 },
    { name: "notes", type: "text", maxLength: 2000 },
  ],
  "INPUT_SUPPLY_REQUEST_CREATED",
  (ctx) => ({ farmId: ctx.body.farmId }),
  async (ctx) => {
    try {
      const result = createInputSupplyRequestService({
        userId: ctx.user.id,
        farmId: ctx.body.farmId as number,
        cropCycleId: ctx.body.cropCycleId as number | null,
        deliveryLocation: ctx.body.deliveryLocation as string | null,
        requestedDate: ctx.body.requestedDate as string | null,
        notes: ctx.body.notes as string | null,
      });
      return NextResponse.json(result, { status: 201 });
    } catch (e: any) {
      return badRequest(e.message);
    }
  },
);
