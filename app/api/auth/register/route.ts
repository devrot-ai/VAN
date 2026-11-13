import { NextResponse } from "next/server";
import { createUser, findUserByEmail, toSafeUser, type Role } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { issueToken } from "@/lib/tokens";
import { isMailConfigured, deliver } from "@/lib/mail";
import { checkRateLimit } from "@/lib/ratelimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["farmer", "provider", "cooperative", "buyer"];

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  farmName?: string;
}

export async function POST(req: Request) {
  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  const role = (body.role ?? "farmer");
  const farmName = (body.farmName ?? "").trim();

  if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });

  // Password strength validation
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return NextResponse.json({ error: strength.issues.join(" ") }, { status: 400 });
  }

  if (!ROLES.includes(role)) return NextResponse.json({ error: "Please choose a valid account type." }, { status: 400 });
  const typedRole = role as Role;
  if (findUserByEmail(email)) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rateLimit = checkRateLimit("register", ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later.", retryAfter: rateLimit.retryAfter },
      { status: 429 },
    );
  }

  const user = createUser({ name, email, passwordHash: hashPassword(password), role: typedRole, farmName });
  await createSession(user.id, true);

  // Email verification: token is issued immediately; how the link reaches the
  // user depends on whether email delivery is configured.
  const verifyToken = issueToken(user.id, "verify");
  let verifyLink: string | undefined;
  if (!isMailConfigured()) {
    verifyLink = `/auth/verify?token=${verifyToken}`;
  } else {
    await deliver({
      to: user.email,
      subject: "Verify your VAN account",
      text: `Welcome to VAN. Verify your account: ${verifyToken}`,
    });
  }

  return NextResponse.json({ user: toSafeUser(user), verifyLink }, { status: 201 });
}
