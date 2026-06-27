import type { CSSProperties } from "react";
import type { Country } from "@shadow-president/engine";

interface WorldMapProps {
  countries: Country[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const REGION_ORDER: Country["region"][] = [
  "north_america",
  "south_america",
  "europe",
  "middle_east",
  "africa",
  "asia",
];

const REGION_LABELS: Record<Country["region"], string> = {
  north_america: "América del Norte",
  south_america: "América del Sur",
  europe: "Europa",
  middle_east: "Medio Oriente",
  africa: "África",
  asia: "Asia",
  oceania: "Oceanía",
};

export function WorldMap({ countries, selectedId, onSelect }: WorldMapProps) {
  const byRegion = REGION_ORDER.map((region) => ({
    region,
    countries: countries.filter((c) => c.region === region && !c.isPlayer),
  })).filter((g) => g.countries.length > 0);

  return (
    <div style={mapContainerStyle}>
      <div style={mapHeaderStyle}>
        <span>MAPA DE SITUACIÓN</span>
        <span style={{ color: "var(--paper-dim)" }}>
          {countries.length - 1} naciones monitoreadas
        </span>
      </div>
      <div style={regionsGridStyle}>
        {byRegion.map(({ region, countries: regionCountries }) => (
          <div key={region} style={regionBlockStyle}>
            <h3 style={regionTitleStyle}>{REGION_LABELS[region] ?? region}</h3>
            <div style={nodesGridStyle}>
              {regionCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => onSelect(country.id)}
                  style={{
                    ...nodeStyle,
                    ...(selectedId === country.id ? nodeSelectedStyle : {}),
                    borderColor: relationBorderColor(country.stats.relationToUS),
                  }}
                  title={`Relación con EE.UU.: ${Math.round(country.stats.relationToUS)}`}
                >
                  <span style={nodeNameStyle}>{country.name}</span>
                  <span
                    style={{
                      ...nodeIndicatorStyle,
                      background: relationBorderColor(country.stats.relationToUS),
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function relationBorderColor(relation: number): string {
  if (relation < 30) return "var(--alert)";
  if (relation > 70) return "var(--positive)";
  return "var(--amber)";
}

const mapContainerStyle: CSSProperties = {
  flex: 1,
  background: "var(--bg-deep)",
  padding: "1.25rem",
  overflowY: "auto",
};

const mapHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  letterSpacing: "0.08em",
  color: "var(--amber)",
  marginBottom: "1rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid var(--line)",
};

const regionsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
};

const regionBlockStyle: CSSProperties = {
  border: "1px solid var(--line)",
  background: "var(--bg-panel)",
  padding: "0.85rem",
};

const regionTitleStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.95rem",
  color: "var(--paper-dim)",
  margin: "0 0 0.6rem 0",
  fontWeight: 600,
};

const nodesGridStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
};

const nodeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "var(--bg-panel-raised)",
  border: "1px solid var(--line)",
  borderLeftWidth: "3px",
  color: "var(--paper)",
  padding: "0.45rem 0.6rem",
  cursor: "pointer",
  fontFamily: "var(--font-ui)",
  fontSize: "0.82rem",
  textAlign: "left",
};

const nodeSelectedStyle: CSSProperties = {
  background: "var(--bg-panel)",
  boxShadow: "0 0 0 1px var(--amber)",
};

const nodeNameStyle: CSSProperties = {
  flex: 1,
};

const nodeIndicatorStyle: CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  flexShrink: 0,
  marginLeft: "0.5rem",
};
