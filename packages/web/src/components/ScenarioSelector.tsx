import { useEffect, useState } from "react";
import { fetchScenarios, type ScenarioDTO } from "../api.js";

interface Props {
  onSelect: (scenario: ScenarioDTO) => void;
  loadingScenario?: boolean;
}

export function ScenarioSelector({ onSelect, loadingScenario = false }: Props) {
  const [scenarios, setScenarios] = useState<ScenarioDTO[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios()
      .then(setScenarios)
      .catch(() => setError("No se pudo conectar con la API. ¿Está corriendo en localhost:3001?"))
      .finally(() => setFetching(false));
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: "2rem",
      background: "var(--bg-deep)",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          color: "var(--amber)",
          fontSize: "2rem",
          letterSpacing: "0.2em",
          margin: 0,
        }}>
          VIRTUALPRESIDENT
        </h1>
        <p style={{
          fontFamily: "var(--font-mono)",
          color: "var(--paper-dim)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          marginTop: "0.5rem",
        }}>
          SELECCIONAR ESCENARIO
        </p>
      </div>

      {fetching && (
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--paper-dim)" }}>
          Cargando escenarios...
        </p>
      )}

      {error && (
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--alert)", maxWidth: 400, textAlign: "center" }}>
          {error}
        </p>
      )}

      {loadingScenario && (
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>
          Cargando escenario...
        </p>
      )}

      {!fetching && !error && !loadingScenario && (
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              style={{
                background: "transparent",
                border: "1px solid var(--amber)",
                color: "var(--amber)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                padding: "1.5rem 2.5rem",
                cursor: "pointer",
                letterSpacing: "0.1em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,164,65,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{s.id}</span>
              <span style={{ color: "var(--paper-dim)", fontSize: "0.75rem" }}>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
