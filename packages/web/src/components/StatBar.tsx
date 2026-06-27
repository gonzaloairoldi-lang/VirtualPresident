interface StatBarProps {
  label: string;
  value: number;
  tone?: "neutral" | "alert" | "positive";
}

export function StatBar({ label, value, tone = "neutral" }: StatBarProps) {
  const fillColor =
    tone === "alert"
      ? "var(--alert)"
      : tone === "positive"
        ? "var(--positive)"
        : "var(--amber)";

  return (
    <div style={{ marginBottom: "0.65rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
          color: "var(--paper-dim)",
          marginBottom: "0.25rem",
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div
        style={{
          height: "6px",
          background: "var(--bg-deep)",
          border: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: fillColor,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
