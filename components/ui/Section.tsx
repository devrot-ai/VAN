type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function Section({ children, className = "", id }: Props) {
  return (
    <section id={id} className={`section ${className}`.trim()}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  dark = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "start" | "center";
  dark?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "grid",
    gap: "var(--space-4)",
    maxWidth: "760px",
    marginInline: align === "center" ? "auto" : undefined,
    textAlign: align,
  };

  return (
    <div style={style}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2
        style={{
          fontSize: "clamp(1.9rem, 4vw, 2.85rem)",
        }}
      >
        {title}
      </h2>
      {lead ? <p className="muted" style={{ fontSize: "var(--text-lg)" }}>{lead}</p> : null}
      {dark ? null : null}
    </div>
  );
}
