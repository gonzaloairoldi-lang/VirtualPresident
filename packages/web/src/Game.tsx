import { useState } from "react";
import { useGame } from "./useGame.js";
import { HeaderBar } from "./components/HeaderBar.js";
import { WorldMap } from "./components/WorldMap.js";
import { CountryPanel } from "./components/CountryPanel.js";
import { EventLog } from "./components/EventLog.js";
import type { Country } from "@shadow-president/engine";

interface Props {
  initialCountries: Record<string, Country>;
}

export function Game({ initialCountries }: Props) {
  const { state, doAction, nextTurn, restart } = useGame(initialCountries);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCountry = selectedId ? state.countries[selectedId] ?? null : null;
  const countryList = Object.values(state.countries);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <HeaderBar
        year={state.year}
        month={state.month}
        popularity={state.popularity}
        gameOver={state.gameOver}
        onNextTurn={nextTurn}
        onRestart={restart}
      />

      {state.gameOver ? (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--paper)" }}>
            Fin de mandato
          </h2>
          <p style={{ color: "var(--paper-dim)", fontFamily: "var(--font-mono)" }}>
            {state.eventLog[state.eventLog.length - 1]?.message}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <WorldMap
            countries={countryList}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <CountryPanel
            country={selectedCountry}
            onAction={(actionId) => {
              if (selectedId) doAction(actionId, selectedId);
            }}
          />
        </div>
      )}

      <EventLog events={state.eventLog} />
    </div>
  );
}
