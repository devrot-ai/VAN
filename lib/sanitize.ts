/**
 * Input sanitization.
 *
 * Strips HTML tags and escapes special characters to prevent XSS injection
 * in user-input text fields (name, notes, messages, farm_name, location).
 */

/**
 * Strip HTML tags and escape special characters.
 * Farm notes and messages don't need HTML — plain text is the correct model.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize a string for safe display, truncating to a max length.
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "";
  const truncated = trimmed.slice(0, maxLength);
  return sanitizeHtml(truncated);
}
