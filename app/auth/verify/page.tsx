import Link from "next/link";
import { redirect } from "next/navigation";
import { peekToken, consumeToken, markVerified } from "@/lib/tokens";
import styles from "../auth.module.css";

export const metadata = { title: "Verify your account — VAN" };
export const dynamic = "force-dynamic";

/**
 * Email verification is a two-step flow by design:
 *
 * 1. GET  — the link lands here; the token is validated read-only and a
 *           confirm button is shown. Nothing is mutated, so link prefetches
 *           and dev double-renders stay harmless.
 * 2. POST — a server action consumes the single-use token and marks the
 *           account verified, then redirects back with a done marker.
 */
async function confirmAction(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const result = consumeToken(token, "verify");
  if (result.ok) markVerified(result.user.id);
  const params = new URLSearchParams({ token });
  if (result.ok) params.set("done", "ok");
  else params.set("done", "failed");
  redirect(`/auth/verify?${params.toString()}`);
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;

  // Step two: a confirm submission already happened.
  if (done === "ok") {
    return (
      <VerificationResult
        title="Email verified"
        body="Your email address is confirmed. Your account is ready to use."
        cta={{ href: "/auth/login", label: "Continue to sign in" }}
      />
    );
  }
  if (done === "failed") {
    return (
      <VerificationResult
        title="Could not verify"
        body="The verification attempt did not succeed — the link may already have been used or has expired."
        cta={{ href: "/auth/register", label: "Create a new account" }}
      />
    );
  }

  // Step one: validate read-only and show a confirm form.
  if (!token) {
    return (
      <VerificationResult
        title="Link not recognised"
        body="Verification links are single-use and expire after 24 hours."
        cta={{ href: "/auth/register", label: "Create a new account" }}
      />
    );
  }

  const peek = peekToken(token.trim(), "verify");
  if (peek.status === "expired") {
    return (
      <VerificationResult
        title="Link expired"
        body="Verification links are single-use and expire after 24 hours. Please register again or sign in."
        cta={{ href: "/auth/register", label: "Create a new account" }}
      />
    );
  }
  if (peek.status === "invalid") {
    return (
      <VerificationResult
        title="Link not recognised"
        body="Verification links are single-use and expire after 24 hours. They stop working once they are confirmed."
        cta={{ href: "/auth/login", label: "Go to sign in" }}
      />
    );
  }

  return (
    <form action={confirmAction}>
      <h1 className={styles.title}>Verify your account</h1>
      <p className={styles.subtitle}>
        This link signs in to verify <strong>{peek.email}</strong>. Confirming is
        one click; the link can only be used this once.
      </p>
      <input type="hidden" name="token" value={token.trim()} />
      <div style={{ marginTop: "var(--space-4)" }}>
        <button type="submit" className={styles.confirmBtn}>
          Confirm verification
        </button>
      </div>
    </form>
  );
}

function VerificationResult({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{body}</p>
      <div style={{ marginTop: "var(--space-4)" }}>
        <Link href={cta.href} className={styles.switch}>
          {cta.label}
        </Link>
      </div>
    </>
  );
}
