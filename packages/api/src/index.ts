import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { getDb } from "./db/client.js";

const app = new Hono();

app.use("/*", cors({ origin: "http://localhost:5173" }));

app.get("/health", (c) => c.json({ ok: true }));

app.get("/scenarios", (c) => {
  const rows = getDb().prepare("SELECT * FROM scenarios").all();
  return c.json(rows);
});

app.get("/scenarios/:id/countries", (c) => {
  const rows = getDb().prepare(
    `SELECT c.*, gr.figure_id as president_id
     FROM countries c
     LEFT JOIN government_roles gr
       ON gr.country_id = c.id
       AND gr.scenario_id = ?
       AND gr.ministry_id = 'presidente'
     WHERE c.id != 'usa'`
  ).all(c.req.param("id"));
  return c.json(rows);
});

app.get("/countries/:id/parties", (c) => {
  const rows = getDb().prepare(
    "SELECT * FROM parties WHERE country_id = ?"
  ).all(c.req.param("id")) as any[];
  return c.json(rows.map((r) => ({ ...r, value_ranges: JSON.parse(r.value_ranges) })));
});

app.get("/figures/:id", (c) => {
  const row = getDb().prepare(
    "SELECT * FROM political_figures WHERE id = ?"
  ).get(c.req.param("id")) as any;
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ ...row, ef_values: JSON.parse(row.ef_values) });
});

app.get("/scenarios/:scenarioId/countries/:countryId/government", (c) => {
  const rows = getDb().prepare(
    `SELECT gr.ministry_id, gr.since_year, gr.since_month,
            pf.id, pf.name, pf.party_id, pf.ef_values
     FROM government_roles gr
     JOIN political_figures pf ON pf.id = gr.figure_id
     WHERE gr.scenario_id = ? AND gr.country_id = ?`
  ).all(c.req.param("scenarioId"), c.req.param("countryId")) as any[];
  return c.json(rows.map((r) => ({ ...r, ef_values: JSON.parse(r.ef_values) })));
});

app.get("/scenarios/:scenarioId/countries/:countryId/economy", (c) => {
  const row = getDb().prepare(
    `SELECT * FROM country_economy_seed WHERE country_id = ? AND scenario_id = ?`
  ).get(c.req.param("countryId"), c.req.param("scenarioId"));
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json(row);
});

app.get("/ministries/:id/actions", (c) => {
  const rows = getDb().prepare(
    "SELECT * FROM actions WHERE ministry_id = ?"
  ).all(c.req.param("id")) as any[];
  return c.json(rows.map((r) => ({ ...r, base_target_delta: JSON.parse(r.base_target_delta) })));
});

const port = 3001;
console.log(`API corriendo en http://localhost:${port}`);
serve({ fetch: app.fetch, port });
