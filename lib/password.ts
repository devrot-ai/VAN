import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Store as "salt:hash" hex strings produced by scrypt.
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(plain, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/**
 * Password strength validation.
 *
 * Requires minimum 10 characters and at least 2 of:
 * uppercase, lowercase, digit, special character.
 */
export interface PasswordStrength {
  valid: boolean;
  issues: string[];
}

export function validatePasswordStrength(plain: string): PasswordStrength {
  const issues: string[] = [];

  if (plain.length < 10) {
    issues.push("Password must be at least 10 characters.");
  }

  const hasUpper = /[A-Z]/.test(plain);
  const hasLower = /[a-z]/.test(plain);
  const hasDigit = /[0-9]/.test(plain);
  const hasSpecial = /[^A-Za-z0-9]/.test(plain);

  const varietyCount = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (varietyCount < 2) {
    issues.push(
      "Password must contain at least 2 of: uppercase, lowercase, digit, special character.",
    );
  }

  return { valid: issues.length === 0, issues };
}
