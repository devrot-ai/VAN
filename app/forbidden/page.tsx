import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--surface-page)", padding: "var(--space-6)" }}>
      <div style={{ maxWidth: 480, textAlign: "center", display: "grid", gap: "var(--space-4)" }}>
        <h1 style={{ fontSize: "2rem" }}>You can’t go there.</h1>
        <p className="muted">
          Your account doesn’t have access to this portal. Each portal is restricted to its
          intended audience.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
          <Button href="/" variant="secondary">Back to homepage</Button>
          <Button href="/app" variant="primary">Go to farmer app</Button>
        </div>
      </div>
    </div>
  );
}
