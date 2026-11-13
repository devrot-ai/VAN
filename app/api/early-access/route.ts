import { NextResponse } from "next/server";
import { addEarlyAccess } from "@/lib/db";
import { withSanitizeOnly, badRequest } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withSanitizeOnly(
  [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "email", type: "text", required: true, maxLength: 254 },
    { name: "role", type: "text", required: true, maxLength: 50 },
    { name: "farm", type: "text", maxLength: 120 },
  ],
  async (ctx) => {
    const name = ctx.body.name as string;
    const email = ctx.body.email as string;
    const role = ctx.body.role as string;
    const farm = (ctx.body.farm as string) || null;

    if (name.length < 2) {
      return badRequest("Please enter your full name.");
    }
    if (!EMAIL_RE.test(email)) {
      return badRequest("Please enter a valid email address.");
    }

    const { duplicate } = addEarlyAccess({ name, email, role, farm: farm ?? undefined });
    return NextResponse.json(
      duplicate
        ? { ok: true, duplicate: true, message: "You are already on the list. We will be in touch." }
        : { ok: true, duplicate: false, message: "Thanks - you are on the list. We will be in touch." },
      { status: 200 },
    );
  },
);
