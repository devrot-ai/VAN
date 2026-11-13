/**
 * Mail delivery via Resend.
 *
 * Configure in .env:
 *   RESEND_API_KEY=re_...
 *   VAN_MAIL_FROM=noreply@yourdomain.com
 *
 * If no API key is set, the product gracefully degrades: callers check
 * `isMailConfigured()` and fall back to showing links on screen.
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export function isMailConfigured(): boolean {
  return Boolean(resend && process.env.VAN_MAIL_FROM);
}

export type OutboundMail = { to: string; subject: string; text: string };

/**
 * Attempt delivery. Returns true only when mail was actually sent.
 * Falls back to console.log in development when no provider is configured.
 */
export async function deliver(mail: OutboundMail): Promise<boolean> {
  if (!resend || !process.env.VAN_MAIL_FROM) {
    // Graceful degradation — log so developer sees the mail in console
    console.log("[Mail] (not configured — would send)", mail);
    return false;
  }

  try {
    await resend.emails.send({
      from: process.env.VAN_MAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    });
    return true;
  } catch (err) {
    console.error("[Mail] Delivery failed:", err);
    return false;
  }
}
