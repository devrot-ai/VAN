import { NextResponse } from "next/server";
import { findUserByEmail, toSafeUser } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

interface LoginBody {
  email?: string;
  password?: string;
  remember?: boolean;
}

export async function POST(req: Request) {
  let body: LoginBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  const remember = Boolean(body.remember);

  if (!email || !password) {
    return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
  }

  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rateLimit = checkRateLimit("login", ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later.", retryAfter: rateLimit.retryAfter },
      { status: 429 },
    );
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await createSession(user.id, remember);
  return NextResponse.json({ user: toSafeUser(user) });
}
