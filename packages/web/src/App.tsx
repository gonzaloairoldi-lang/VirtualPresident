import { useState } from "react";
import { HeaderBar } from "./components/HeaderBar.js";
import { WorldMap } from "./components/WorldMap.js";
import { CountryPanel } from "./components/CountryPanel.js";
import { EventLog } from "./components/EventLog.js";
import { ScenarioSelector } from "./components/ScenarioSelector.js";
import { fetchCountries, REGION_MAP, type ScenarioDTO } from "./api.js";
import type { Country } from "@shadow-president/engine";
import { Game } from "./Game.js";

export default function App() {
  const [countries, setCountries] = useState<Record<string, Country> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelectScenario(s: ScenarioDTO) {
    setLoading(true);
    try {
      const raw = await fetchCountries(s.id);
      const mapped: Record<string, Country> = {};
      for (const c of raw) {
        const region = (REGION_MAP[c.region] ?? "south_america") as Country["region"];
        mapped[c.id] = {
          id: c.id,
          name: c.name,
          region,
          stats: {
            qualityOfLife: 50,
            stability: 50,
            economy: 50,
            militaryStrength: 50,
            relationToUS: 50,
          },
        };
      }
      setCountries(mapped);
    } finally {
      setLoading(false);
    }
  }

  if (!countries) {
    return (
      <ScenarioSelector
        onSelect={handleSelectScenario}
        loadingScenario={loading}
      />
    );
  }

  return <Game initialCountries={countries} />;
}
