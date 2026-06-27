import type { CSSProperties } from "react";
import type { GameEvent } from "@shadow-president/engine";

interface EventLogProps {
  events: GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const recent = events.slice(-6).reverse();

  return (
    <div style={logStyle}>
      <div style={logHeaderStyle}>TRANSMISIÓN · INFORME DE INTELIGENCIA</div>
      <div style={logBodyStyle}>
        {recent.map((event, i) => (
          <p key={i} style={logLineStyle}>
            <span style={logTimestampStyle}>
              [{String(event.month).padStart(2, "0")}/{event.year}]
            </span>{" "}
            {event.message}
          </p>
        ))}
      </div>
    </div>
  );
}

const logStyle: CSSProperties = {
  borderTop: "1px solid var(--line)",
  background: "var(--bg-panel)",
  padding: "0.75rem 1.25rem",
  maxHeight: "160px",
  overflowY: "auto",
};

const logHeaderStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "0.08em",
  color: "var(--amber-dim)",
  marginBottom: "0.5rem",
};

const logBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const logLineStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.78rem",
  color: "var(--paper)",
  margin: 0,
  lineHeight: 1.4,
};

const logTimestampStyle: CSSProperties = {
  color: "var(--amber)",
};
