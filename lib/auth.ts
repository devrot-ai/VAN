import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { cleanupExpiredSessions, cleanupExpiredTokens } from "@/lib/tokens";
import { getDb, getUserById, toSafeUser, type SafeUser } from "@/lib/db";

const COOKIE = "van_session";
const SESSION_DAYS = 30;

let _startupCleanupDone = false;

function runStartupCleanup() {
  if (_startupCleanupDone) return;
  _startupCleanupDone = true;
  cleanupExpiredSessions();
  cleanupExpiredTokens();
}

export async function createSession(userId: number, remember: boolean) {
  const token = randomBytes(32).toString("hex");
  const ttl = remember ? SESSION_DAYS * 24 * 3600 : 12 * 3600;
  const expiresAt = Date.now() + ttl * 1000;
  getDb().prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)").run(token, userId, expiresAt);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Secure flag: only send the cookie over HTTPS. We enable it not just in
    // production builds but also on preview deployments (Vercel serves previews
    // over HTTPS while leaving NODE_ENV === "development").
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "preview",
    maxAge: ttl,
  });
}

/**
 * Session rotation: if a session is more than 50% expired, replace it with a
 * fresh 30-day token. This keeps active sessions alive without requiring re-login.
 */
async function rotateSessionIfNeeded(token: string, userId: number, expiresAt: number) {
  const now = Date.now();
  const sessionAge = now - (expiresAt - SESSION_DAYS * 24 * 3600 * 1000);
  const halfLife = SESSION_DAYS * 24 * 3600 * 1000 / 2;

  if (sessionAge > halfLife) {
    // Session is more than 50% expired — rotate it
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
    await createSession(userId, true);
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  runStartupCleanup();
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const row = getDb().prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?").get(token) as
    | { user_id: number; expires_at: number }
    | undefined;
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    // Prune expired sessions while validating so the table doesn't grow.
    cleanupExpiredSessions();
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  // Rotate session if it's more than 50% expired
  await rotateSessionIfNeeded(token, row.user_id, row.expires_at);
  const user = getUserById(row.user_id);
  if (!user) return null;
  return toSafeUser(user);
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
    store.delete(COOKIE);
  }
}
