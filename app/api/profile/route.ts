import { NextResponse } from "next/server";
import { withAuthAndSanitize } from "@/lib/api";
import { updateFarmProfile } from "@/lib/db";

/**
 * Profile updates for the signed-in account. `farm_name` stores the farm
 * (farmers) or business (providers, cooperatives, buyers); `location` is a
 * plain place name used for weather and search — it is never treated as a
 * precise address.
 */
export const PUT = withAuthAndSanitize(
  {},
  [
    { name: "farmName", type: "text", maxLength: 120 },
    { name: "location", type: "text", maxLength: 120 },
  ],
  "PROFILE_UPDATED",
  (ctx) => ({ userId: ctx.user.id }),
  async (ctx) => {
    const farmName = (ctx.body.farmName as string) || null;
    const location = (ctx.body.location as string) || null;
    updateFarmProfile(ctx.user.id, { farmName, location });
    return NextResponse.json({ ok: true });
  },
);

// Backward-compatible alias: POST is deprecated but still works
export { PUT as POST };
