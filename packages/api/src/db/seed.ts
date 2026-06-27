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

  // Datos económicos iniciales por país y escenario
  // Unidades: moneda local en miles de millones, USD en miles de millones
  const economyData: Array<{
    country_id: string; scenario_id: string;
    tax_revenue: number; soe_revenue: number; ministry_spending: number;
    local_debt: number; money_supply: number; inflation_rate: number;
    exchange_rate_regime: string; exchange_rate: number;
    reserves_usd: number; exports_usd: number; imports_usd: number;
    external_debt_usd: number; score_historial: number; default_count: number;
  }> = [
    // ── 1989 ──────────────────────────────────────────────────────────────
    { country_id: "argentina", scenario_id: "1989",
      tax_revenue: 1.2, soe_revenue: 0.3, ministry_spending: 2.1,
      local_debt: 45, money_supply: 100, inflation_rate: 8.5,
      exchange_rate_regime: "fixed", exchange_rate: 650,
      reserves_usd: 1.8, exports_usd: 1.1, imports_usd: 0.9,
      external_debt_usd: 65, score_historial: 18, default_count: 2 },

    { country_id: "brazil", scenario_id: "1989",
      tax_revenue: 8.5, soe_revenue: 2.1, ministry_spending: 12.0,
      local_debt: 120, money_supply: 100, inflation_rate: 25.0,
      exchange_rate_regime: "float", exchange_rate: 2.8,
      reserves_usd: 8.0, exports_usd: 4.8, imports_usd: 3.2,
      external_debt_usd: 115, score_historial: 28, default_count: 1 },

    { country_id: "chile", scenario_id: "1989",
      tax_revenue: 2.1, soe_revenue: 0.8, ministry_spending: 2.0,
      local_debt: 12, money_supply: 100, inflation_rate: 1.3,
      exchange_rate_regime: "float", exchange_rate: 290,
      reserves_usd: 3.5, exports_usd: 1.4, imports_usd: 1.1,
      external_debt_usd: 17, score_historial: 62, default_count: 0 },

    { country_id: "colombia", scenario_id: "1989",
      tax_revenue: 1.8, soe_revenue: 0.5, ministry_spending: 2.0,
      local_debt: 18, money_supply: 100, inflation_rate: 2.4,
      exchange_rate_regime: "float", exchange_rate: 382,
      reserves_usd: 3.8, exports_usd: 1.5, imports_usd: 1.2,
      external_debt_usd: 17, score_historial: 48, default_count: 0 },

    { country_id: "venezuela", scenario_id: "1989",
      tax_revenue: 3.5, soe_revenue: 4.2, ministry_spending: 5.8,
      local_debt: 25, money_supply: 100, inflation_rate: 5.8,
      exchange_rate_regime: "fixed", exchange_rate: 38,
      reserves_usd: 6.5, exports_usd: 3.8, imports_usd: 2.5,
      external_debt_usd: 32, score_historial: 38, default_count: 0 },

    { country_id: "peru", scenario_id: "1989",
      tax_revenue: 0.8, soe_revenue: 0.3, ministry_spending: 1.8,
      local_debt: 35, money_supply: 100, inflation_rate: 42.0,
      exchange_rate_regime: "fixed", exchange_rate: 2700,
      reserves_usd: 0.5, exports_usd: 0.7, imports_usd: 0.8,
      external_debt_usd: 19, score_historial: 22, default_count: 1 },

    { country_id: "uruguay", scenario_id: "1989",
      tax_revenue: 0.6, soe_revenue: 0.2, ministry_spending: 0.7,
      local_debt: 8, money_supply: 100, inflation_rate: 5.8,
      exchange_rate_regime: "float", exchange_rate: 610,
      reserves_usd: 0.8, exports_usd: 0.4, imports_usd: 0.5,
      external_debt_usd: 4, score_historial: 55, default_count: 0 },

    { country_id: "bolivia", scenario_id: "1989",
      tax_revenue: 0.3, soe_revenue: 0.2, ministry_spending: 0.5,
      local_debt: 6, money_supply: 100, inflation_rate: 1.5,
      exchange_rate_regime: "float", exchange_rate: 2.9,
      reserves_usd: 0.4, exports_usd: 0.3, imports_usd: 0.4,
      external_debt_usd: 5, score_historial: 30, default_count: 1 },

    { country_id: "paraguay", scenario_id: "1989",
      tax_revenue: 0.2, soe_revenue: 0.1, ministry_spending: 0.3,
      local_debt: 3, money_supply: 100, inflation_rate: 2.8,
      exchange_rate_regime: "fixed", exchange_rate: 1250,
      reserves_usd: 0.7, exports_usd: 0.5, imports_usd: 0.6,
      external_debt_usd: 2, score_historial: 32, default_count: 0 },

    { country_id: "ecuador", scenario_id: "1989",
      tax_revenue: 0.5, soe_revenue: 0.4, ministry_spending: 0.9,
      local_debt: 10, money_supply: 100, inflation_rate: 4.2,
      exchange_rate_regime: "float", exchange_rate: 530,
      reserves_usd: 0.6, exports_usd: 0.7, imports_usd: 0.6,
      external_debt_usd: 11, score_historial: 35, default_count: 0 },

    // ── 2024 ──────────────────────────────────────────────────────────────
    { country_id: "argentina", scenario_id: "2024",
      tax_revenue: 8.5, soe_revenue: 1.2, ministry_spending: 10.5,
      local_debt: 45000, money_supply: 100, inflation_rate: 12.0,
      exchange_rate_regime: "float", exchange_rate: 900,
      reserves_usd: 28, exports_usd: 7.0, imports_usd: 5.5,
      external_debt_usd: 280, score_historial: 12, default_count: 9 },

    { country_id: "brazil", scenario_id: "2024",
      tax_revenue: 180, soe_revenue: 22, ministry_spending: 210,
      local_debt: 7200, money_supply: 100, inflation_rate: 0.4,
      exchange_rate_regime: "float", exchange_rate: 5.1,
      reserves_usd: 355, exports_usd: 32, imports_usd: 22,
      external_debt_usd: 680, score_historial: 38, default_count: 1 },

    { country_id: "chile", scenario_id: "2024",
      tax_revenue: 9.5, soe_revenue: 3.5, ministry_spending: 10.2,
      local_debt: 180, money_supply: 100, inflation_rate: 0.3,
      exchange_rate_regime: "float", exchange_rate: 940,
      reserves_usd: 43, exports_usd: 8.5, imports_usd: 7.2,
      external_debt_usd: 210, score_historial: 72, default_count: 0 },

    { country_id: "colombia", scenario_id: "2024",
      tax_revenue: 15, soe_revenue: 3, ministry_spending: 18,
      local_debt: 620, money_supply: 100, inflation_rate: 0.7,
      exchange_rate_regime: "float", exchange_rate: 3950,
      reserves_usd: 58, exports_usd: 5.5, imports_usd: 5.8,
      external_debt_usd: 180, score_historial: 42, default_count: 0 },

    { country_id: "venezuela", scenario_id: "2024",
      tax_revenue: 1.2, soe_revenue: 0.8, ministry_spending: 2.5,
      local_debt: 9999, money_supply: 100, inflation_rate: 15.0,
      exchange_rate_regime: "fixed", exchange_rate: 36,
      reserves_usd: 9, exports_usd: 1.5, imports_usd: 2.8,
      external_debt_usd: 150, score_historial: 5, default_count: 3 },

    { country_id: "peru", scenario_id: "2024",
      tax_revenue: 12, soe_revenue: 2, ministry_spending: 13,
      local_debt: 280, money_supply: 100, inflation_rate: 0.25,
      exchange_rate_regime: "float", exchange_rate: 3.75,
      reserves_usd: 72, exports_usd: 6, imports_usd: 5.5,
      external_debt_usd: 90, score_historial: 45, default_count: 1 },

    { country_id: "uruguay", scenario_id: "2024",
      tax_revenue: 4.5, soe_revenue: 1.2, ministry_spending: 4.8,
      local_debt: 55, money_supply: 100, inflation_rate: 0.5,
      exchange_rate_regime: "float", exchange_rate: 39,
      reserves_usd: 18, exports_usd: 2.2, imports_usd: 2.0,
      external_debt_usd: 28, score_historial: 68, default_count: 0 },

    { country_id: "bolivia", scenario_id: "2024",
      tax_revenue: 3.5, soe_revenue: 1.5, ministry_spending: 5.2,
      local_debt: 120, money_supply: 100, inflation_rate: 0.8,
      exchange_rate_regime: "fixed", exchange_rate: 6.9,
      reserves_usd: 1.8, exports_usd: 1.2, imports_usd: 2.1,
      external_debt_usd: 14, score_historial: 28, default_count: 1 },

    { country_id: "paraguay", scenario_id: "2024",
      tax_revenue: 2.8, soe_revenue: 0.5, ministry_spending: 2.9,
      local_debt: 48, money_supply: 100, inflation_rate: 0.3,
      exchange_rate_regime: "float", exchange_rate: 7300,
      reserves_usd: 10, exports_usd: 2.5, imports_usd: 3.0,
      external_debt_usd: 12, score_historial: 35, default_count: 0 },

    { country_id: "ecuador", scenario_id: "2024",
      tax_revenue: 5.5, soe_revenue: 1.0, ministry_spending: 6.2,
      local_debt: 95, money_supply: 100, inflation_rate: 0.1,
      exchange_rate_regime: "fixed", exchange_rate: 1,  // dolarizado
      reserves_usd: 4.5, exports_usd: 2.8, imports_usd: 2.5,
      external_debt_usd: 58, score_historial: 30, default_count: 1 },
  ];

  const insertEconomy = db.prepare(
    `INSERT OR IGNORE INTO country_economy_seed
     (country_id, scenario_id, tax_revenue, soe_revenue, ministry_spending,
      local_debt, money_supply, inflation_rate, exchange_rate_regime, exchange_rate,
      reserves_usd, exports_usd, imports_usd, external_debt_usd, score_historial, default_count)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );

  for (const e of economyData) {
    insertEconomy.run(
      e.country_id, e.scenario_id, e.tax_revenue, e.soe_revenue, e.ministry_spending,
      e.local_debt, e.money_supply, e.inflation_rate, e.exchange_rate_regime, e.exchange_rate,
      e.reserves_usd, e.exports_usd, e.imports_usd, e.external_debt_usd,
      e.score_historial, e.default_count
    );
  }

  db.exec("COMMIT");
  console.log("✓ Seed completado.");
} catch (e) {
  db.exec("ROLLBACK");
  console.error("✗ Error en seed:", e);
  process.exit(1);
}
