import { withAuth, badRequest, notFound } from "@/lib/api";
import { NextResponse } from "next/server";
import {
  getInputSupplyRequestByIdService,
  submitInputSupplyRequestService,
} from "@/lib/services/inputSupply";

export const GET = withAuth({}, async (ctx) => {
  const url = new URL(ctx.user ? "" : "");
  const id = Number(ctx.body?.id);
  const result = getInputSupplyRequestByIdService(id);
  if (!result) return notFound();
  return NextResponse.json(result);
});

export const POST = withAuth({}, async (ctx) => {
  const url = new URL(ctx.user ? "" : "");
  const id = Number(ctx.body?.id);
  try {
    submitInputSupplyRequestService(id, ctx.user.id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return badRequest(e.message);
  }
});
