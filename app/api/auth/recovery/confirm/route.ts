import { NextResponse } from "next/server";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { resetPasswordWithToken } from "@/lib/tokens";

interface ConfirmBody {
  token?: string;
  password?: string;
}

/**
 * Step two of recovery: consume the single-use reset token and set a new
 * password. All existing sessions are revoked on success.
 */
export async function POST(req: Request) {
  let body: ConfirmBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const password = body.password ?? "";
  if (!token) return NextResponse.json({ error: "Your reset link is missing its token." }, { status: 400 });

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return NextResponse.json({ error: strength.issues.join(" ") }, { status: 400 });
  }

  const result = resetPasswordWithToken(token, hashPassword(password));
  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "That reset link has expired. Please request a new one."
        : "That reset link is not valid. Please request a new one.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
