import type { CSSProperties } from "react";
import type { Country } from "@shadow-president/engine";
import { ACTIONS } from "@shadow-president/engine";
import { StatBar } from "./StatBar.js";

interface CountryPanelProps {
  country: Country | null;
  onAction: (actionId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  diplomatic: "Diplomática",
  economic: "Económica",
  covert: "Encubierta",
  military: "Militar",
};

export function CountryPanel({ country, onAction }: CountryPanelProps) {
  if (!country) {
    return (
      <aside style={panelStyle}>
        <p style={emptyStateStyle}>
          Seleccioná un país en el mapa para ver su informe de situación.
        </p>
      </aside>
    );
  }

  if (country.isPlayer) {
    return (
      <aside style={panelStyle}>
        <h2 style={titleStyle}>{country.name}</h2>
        <p style={emptyStateStyle}>
          Este es tu país. No podés dirigir acciones contra Estados Unidos.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <StatBar label="Calidad de vida" value={country.stats.qualityOfLife} tone="positive" />
          <StatBar label="Estabilidad" value={country.stats.stability} tone="positive" />
          <StatBar label="Economía" value={country.stats.economy} tone="positive" />
          <StatBar label="Fuerza militar" value={country.stats.militaryStrength} />
        </div>
      </aside>
    );
  }

  const relationTone =
    country.stats.relationToUS < 30 ? "alert" : country.stats.relationToUS > 70 ? "positive" : "neutral";

  const actionsByCategory = ACTIONS.reduce<Record<string, typeof ACTIONS>>((acc, action) => {
    (acc[action.category] ??= []).push(action);
    return acc;
  }, {});

  return (
    <aside style={panelStyle}>
      <h2 style={titleStyle}>{country.name}</h2>
      <p style={regionStyle}>{regionLabel(country.region)}</p>

      <div style={{ marginTop: "1rem" }}>
        <StatBar label="Calidad de vida" value={country.stats.qualityOfLife} />
        <StatBar label="Estabilidad" value={country.stats.stability} tone={country.stats.stability < 30 ? "alert" : "neutral"} />
        <StatBar label="Economía" value={country.stats.economy} />
        <StatBar label="Fuerza militar" value={country.stats.militaryStrength} />
        <StatBar label="Relación con EE.UU." value={country.stats.relationToUS} tone={relationTone} />
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {Object.entries(actionsByCategory).map(([category, actions]) => (
          <div key={category} style={{ marginBottom: "1rem" }}>
            <h3 style={categoryTitleStyle}>{CATEGORY_LABELS[category] ?? category}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id)}
                  title={action.description}
                  style={actionButtonStyle}
                >
                  {action.label}
                  {action.cost > 0 && (
                    <span style={costStyle}> · {action.cost} pts</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function regionLabel(region: Country["region"]): string {
  const map: Record<Country["region"], string> = {
    north_america: "América del Norte",
    south_america: "América del Sur",
    europe: "Europa",
    middle_east: "Medio Oriente",
    africa: "África",
    asia: "Asia",
    oceania: "Oceanía",
  };
  return map[region] ?? region;
}

const panelStyle: CSSProperties = {
  background: "var(--bg-panel)",
  border: "1px solid var(--line)",
  padding: "1.25rem",
  width: "320px",
  flexShrink: 0,
  overflowY: "auto",
};

const titleStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "1.4rem",
  margin: 0,
  color: "var(--paper)",
};

const regionStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  letterSpacing: "0.05em",
  color: "var(--amber-dim)",
  textTransform: "uppercase",
  marginTop: "0.2rem",
};

const categoryTitleStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--paper-dim)",
  borderBottom: "1px solid var(--line)",
  paddingBottom: "0.3rem",
  marginBottom: "0.5rem",
};

const actionButtonStyle: CSSProperties = {
  background: "var(--bg-panel-raised)",
  border: "1px solid var(--line)",
  color: "var(--paper)",
  padding: "0.5rem 0.65rem",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontFamily: "var(--font-ui)",
};

const costStyle: CSSProperties = {
  color: "var(--amber-dim)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
};

const emptyStateStyle: CSSProperties = {
  color: "var(--paper-dim)",
  fontSize: "0.85rem",
  lineHeight: 1.5,
};
