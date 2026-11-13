import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { issueToken } from "@/lib/tokens";
import { isMailConfigured, deliver } from "@/lib/mail";
import { checkRateLimit } from "@/lib/ratelimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RecoveryBody {
  email?: string;
}

/**
 * Password recovery.
 *
 * anti-enumeration: the response is always `{ ok: true }` regardless of
 * whether the account exists — the same message, the same status.
 *
 * One deliberate, documented exception: when email delivery is NOT configured
 * (development / early-access environments), the reset link is returned so the
 * flow is usable and testable for members of the beta team. Once a mail
 * provider is connected, the link is emailed and never put in the response.
 */
export async function POST(req: Request) {
  let body: RecoveryBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // Rate limiting by email
  const rateLimit = checkRateLimit("reset", email);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: true, retryAfter: rateLimit.retryAfter },
      { status: 429 },
    );
  }

  const response: { ok: true; resetLink?: string } = { ok: true };
  const user = findUserByEmail(email);
  if (user) {
    const token = issueToken(user.id, "reset");
    if (isMailConfigured()) {
      await deliver({
        to: user.email,
        subject: "Reset your VAN password",
        text: `Reset your password with this single-use link: /auth/recovery/reset?token=${token}`,
      });
    } else {
      response.resetLink = `/auth/recovery/reset?token=${token}`;
    }
  }

  return NextResponse.json(response);
}
