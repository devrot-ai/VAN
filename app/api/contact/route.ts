import { NextResponse } from "next/server";
import { addContactMessage } from "@/lib/db";
import { withSanitizeOnly, badRequest } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withSanitizeOnly(
  [
    { name: "name", type: "text", required: true, maxLength: 120 },
    { name: "email", type: "text", required: true, maxLength: 254 },
    { name: "subject", type: "text", required: true, maxLength: 200 },
    { name: "body", type: "text", required: true, maxLength: 2000 },
  ],
  async (ctx) => {
    const name = ctx.body.name as string;
    const email = ctx.body.email as string;
    const subject = ctx.body.subject as string;
    const message = ctx.body.body as string;

    if (name.length < 2) {
      return badRequest("Please enter your name.");
    }
    if (!EMAIL_RE.test(email)) {
      return badRequest("Please enter a valid email.");
    }
    if (message.length < 10) {
      return badRequest("Please write a message (at least 10 characters).");
    }

    addContactMessage({ name, email, subject, body: message });
    return NextResponse.json({ ok: true, message: "Thanks for reaching out. We'll reply within two working days." });
  },
);
