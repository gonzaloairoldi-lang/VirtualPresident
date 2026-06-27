import type { CSSProperties } from "react";

interface HeaderBarProps {
  year: number;
  month: number;
  popularity: number;
  gameOver: boolean;
  onNextTurn: () => void;
  onRestart: () => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function HeaderBar({
  year,
  month,
  popularity,
  gameOver,
  onNextTurn,
  onRestart,
}: HeaderBarProps) {
  const stampTone = popularity < 40 ? "var(--alert)" : popularity > 60 ? "var(--positive)" : "var(--amber)";

  return (
    <header style={headerStyle}>
      <div>
        <h1 style={titleStyle}>VIRTUALPRESIDENT</h1>
        <p style={subtitleStyle}>Despacho Oval · Informe de Situación</p>
      </div>

      <div style={dateStyle}>{MONTHS[month - 1]} {year}</div>

      <div style={{ ...stampStyle, borderColor: stampTone, color: stampTone }}>
        <span style={stampLabelStyle}>Aprobación</span>
        <span style={stampValueStyle}>{Math.round(popularity)}%</span>
      </div>

      {gameOver ? (
        <button onClick={onRestart} style={actionBtnStyle}>
          Nueva administración
        </button>
      ) : (
        <button onClick={onNextTurn} style={actionBtnStyle}>
          Avanzar mes →
        </button>
      )}
    </header>
  );
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  padding: "1rem 1.5rem",
  borderBottom: "1px solid var(--line)",
  background: "var(--bg-panel)",
};

const titleStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1.3rem",
  letterSpacing: "0.04em",
  margin: 0,
  color: "var(--paper)",
};

const subtitleStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  color: "var(--paper-dim)",
  margin: "0.15rem 0 0 0",
  letterSpacing: "0.05em",
};

const dateStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.95rem",
  color: "var(--amber)",
  marginLeft: "auto",
};

const stampStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "2px solid",
  borderRadius: "4px",
  padding: "0.3rem 0.9rem",
  transform: "rotate(-2deg)",
};

const stampLabelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const stampValueStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1.1rem",
  fontWeight: 700,
};

const actionBtnStyle: CSSProperties = {
  background: "var(--amber)",
  color: "var(--bg-deep)",
  border: "none",
  padding: "0.6rem 1.1rem",
  fontFamily: "var(--font-ui)",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
};
