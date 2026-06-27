const API_BASE = "http://localhost:3001";

export interface ScenarioDTO {
  id: string;
  name: string;
  start_year: number;
  start_month: number;
}

export interface CountryDTO {
  id: string;
  name: string;
  capital: string;
  region: string;
  is_player: number;
  president_id: string | null;
}

export async function fetchScenarios(): Promise<ScenarioDTO[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  return res.json();
}

export async function fetchCountries(scenarioId: string): Promise<CountryDTO[]> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/countries`);
  return res.json();
}

// Mapeo de región API → engine
export const REGION_MAP: Record<string, string> = {
  "América del Sur": "south_america",
  "América del Norte": "north_america",
  "Europa": "europe",
  "Medio Oriente": "middle_east",
  "África": "africa",
  "Asia": "asia",
  "Oceanía": "oceania",
  "south_america": "south_america",
  "north_america": "north_america",
  "europe": "europe",
  "middle_east": "middle_east",
  "africa": "africa",
  "asia": "asia",
};
