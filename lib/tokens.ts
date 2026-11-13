import { randomBytes, createHash } from "node:crypto";
import { getDb, getUserById, type User } from "@/lib/db";

/**
 * Auth tokens (email verification, password recovery).
 *
 * Tokens are 32 random bytes, shown once, and only their SHA-256 hash is
 * stored. Every token has a kind, a TTL and single use semantics, so a
 * database leak cannot be replayed against the product.
 */

export type TokenKind = "verify" | "reset";

const KIND_TTL_MS: Record<TokenKind, number> = {
  verify: 24 * 3600 * 1000, // 24 hours
  reset: 3600 * 1000, // 1 hour
};

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function issueToken(userId: number, kind: TokenKind): string {
  const raw = randomBytes(32).toString("hex");
  const db = getDb();
  // One active token per user/kind: replacing keeps sessions and accounts clean.
  db.prepare("DELETE FROM auth_tokens WHERE user_id = ? AND kind = ?").run(userId, kind);
  db.prepare(
    "INSERT INTO auth_tokens (user_id, token_hash, kind, expires_at) VALUES (?,?,?,?)",
  ).run(userId, hashToken(raw), kind, Date.now() + KIND_TTL_MS[kind]);
  return raw;
}

export type PeekResult =
  | { status: "valid"; email: string }
  | { status: "expired" }
  | { status: "invalid" };

/**
 * Read-only token validation for two-step flows (render a confirm page, then
 * consume in a POST action). Never mutates state.
 */
export function peekToken(raw: string, kind: TokenKind): PeekResult {
  const db = getDb();
  const row = db
    .prepare("SELECT user_id, expires_at FROM auth_tokens WHERE token_hash = ? AND kind = ? AND used_at IS NULL")
    .get(hashToken(raw), kind) as { user_id: number; expires_at: number } | undefined;
  if (!row) return { status: "invalid" };
  if (row.expires_at < Date.now()) return { status: "expired" };
  const user = getUserById(row.user_id);
  if (!user) return { status: "invalid" };
  return { status: "valid", email: user.email };
}

/** Remove tokens that have expired and have never been used — keeps the
 * auth_tokens table from growing unbounded in long-running deployments.
 * Idempotent and safe to call on every request. */
export function cleanupExpiredTokens(): void {
  const db = getDb();
  db.prepare("DELETE FROM auth_tokens WHERE used_at IS NULL AND expires_at < ?").run(Date.now());
}

/** Remove sessions that have expired. Idempotent and safe to call on every request. */
export function cleanupExpiredSessions(): void {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
}

export type ConsumeResult =
  | { ok: true; user: User }
  | { ok: false; reason: "invalid" | "expired" };

export function consumeToken(raw: string, kind: TokenKind): ConsumeResult {
  const db = getDb();
  const incoming = hashToken(raw);
  const row = db
    .prepare("SELECT * FROM auth_tokens WHERE token_hash = ? AND kind = ? AND used_at IS NULL")
    .get(incoming, kind) as
    | { id: number; user_id: number; expires_at: number }
    | undefined;
  if (!row) return { ok: false, reason: "invalid" };
  if (row.expires_at < Date.now()) return { ok: false, reason: "expired" };

  // Prune any expired, unused tokens before consuming (keeps the table tidy).
  cleanupExpiredTokens();

  const user = getUserById(row.user_id);
  if (!user) return { ok: false, reason: "invalid" };

  db.prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ?").run(
    new Date().toISOString(),
    row.id,
  );
  return { ok: true, user };
}

export function resetPasswordWithToken(raw: string, passwordHash: string): ConsumeResult {
  const result = consumeToken(raw, "reset");
  if (result.ok) {
    const db = getDb();
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
      passwordHash,
      result.user.id,
    );
    // Security: after a password change, every existing session is revoked.
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(result.user.id);
  }
  return result;
}

export function markVerified(userId: number) {
  const db = getDb();
  db.prepare("UPDATE users SET verified_at = ? WHERE id = ? AND verified_at IS NULL").run(
    new Date().toISOString(),
    userId,
  );
}
