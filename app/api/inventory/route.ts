import { withAuth } from "@/lib/api";
import { NextResponse } from "next/server";
import { listInventoryService } from "@/lib/services/inputSupply";

export const GET = withAuth({}, async (ctx) => {
  const inventory = listInventoryService(ctx.user.id);
  return NextResponse.json({ inventory });
});
