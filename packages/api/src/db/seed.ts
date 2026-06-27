import { getDb } from "./client.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const data = JSON.parse(
  readFileSync(
    join(__dirname, "../../../../packages/engine/src/data/south_america.json"),
    "utf-8"
  )
);

const db = getDb();

const scenarioMeta: Record<string, { name: string; year: number; month: number }> = {
  "1989": { name: "Guerra Fría — 1989", year: 1989, month: 6 },
  "2024": { name: "Mundo Multipolar — 2024", year: 2024, month: 1 },
};

db.exec("BEGIN");

try {
  for (const [scenarioId, meta] of Object.entries(scenarioMeta)) {
    db.prepare(
      `INSERT OR IGNORE INTO scenarios (id, name, start_year, start_month) VALUES (?, ?, ?, ?)`
    ).run(scenarioId, meta.name, meta.year, meta.month);

    const scenarioData = data.scenarios[scenarioId];
    if (!scenarioData) continue;

    for (const country of scenarioData.countries) {
      db.prepare(
        `INSERT OR IGNORE INTO regions (id, name) VALUES (?, ?)`
      ).run(country.region, country.region.replace("_", " "));

      db.prepare(
        `INSERT OR IGNORE INTO countries (id, name, capital, region) VALUES (?, ?, ?, ?)`
      ).run(country.id, country.name, country.capital, country.region);

      for (const party of country.parties) {
        db.prepare(
          `INSERT OR IGNORE INTO parties (id, country_id, name, short_name, founded, ideology, value_ranges)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          party.id,
          country.id,
          party.name,
          party.short_name ?? party.short ?? party.name,
          party.founded,
          party.ideology,
          JSON.stringify(party.ranges)
        );
      }

      for (const candidate of country.candidates) {
        db.prepare(
          `INSERT OR IGNORE INTO political_figures (id, name, party_id, ef_values)
           VALUES (?, ?, ?, ?)`
        ).run(
          candidate.id,
          candidate.name,
          candidate.party_id,
          JSON.stringify(candidate.values)
        );
      }

      db.prepare(
        `INSERT OR IGNORE INTO government_roles (country_id, scenario_id, ministry_id, figure_id, since_year, since_month)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(country.id, scenarioId, "presidente", country.leader_id, meta.year, 1);
    }
  }

  db.exec("COMMIT");
  console.log("✓ Seed completado.");
} catch (e) {
  db.exec("ROLLBACK");
  console.error("✗ Error en seed:", e);
  process.exit(1);
}
