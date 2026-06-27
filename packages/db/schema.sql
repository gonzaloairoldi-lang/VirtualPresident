-- ============================================================
-- VirtualPresident — Schema SQLite
-- ============================================================
-- Convención de valores: todos los stats normalizados 0-100.
-- JSON columns se usan para los 12 valores del Economic Freedom
-- Index (evitar 12 columnas repetidas en cada tabla).
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- ESCENARIOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scenarios (
  id           TEXT PRIMARY KEY,   -- '1989', '2024'
  name         TEXT NOT NULL,
  start_year   INTEGER NOT NULL,
  start_month  INTEGER NOT NULL
);

-- ------------------------------------------------------------
-- GEOGRAFÍA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS regions (
  id   TEXT PRIMARY KEY,   -- 'south_america', 'europe', etc.
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS countries (
  id       TEXT PRIMARY KEY,   -- 'argentina', 'brazil', etc.
  name     TEXT NOT NULL,
  capital  TEXT NOT NULL,
  region   TEXT NOT NULL REFERENCES regions(id),
  is_player INTEGER NOT NULL DEFAULT 0   -- 1 solo para USA
);

-- Stats de juego por escenario (legados del engine actual)
CREATE TABLE IF NOT EXISTS country_scenario_stats (
  country_id      TEXT NOT NULL REFERENCES countries(id),
  scenario_id     TEXT NOT NULL REFERENCES scenarios(id),
  quality_of_life INTEGER NOT NULL,   -- 0-100
  stability       INTEGER NOT NULL,   -- 0-100
  economy         INTEGER NOT NULL,   -- 0-100
  military        INTEGER NOT NULL,   -- 0-100
  relation_to_us  INTEGER NOT NULL,   -- 0-100
  PRIMARY KEY (country_id, scenario_id)
);

-- Intereses estructurales entre países por escenario (inicial)
-- Se copian a structural_interests al crear una partida
CREATE TABLE IF NOT EXISTS country_structural_interests_seed (
  from_country  TEXT NOT NULL REFERENCES countries(id),
  to_country    TEXT NOT NULL REFERENCES countries(id),
  scenario_id   TEXT NOT NULL REFERENCES scenarios(id),
  value         REAL NOT NULL,   -- 0-100
  PRIMARY KEY (from_country, to_country, scenario_id)
);

-- ------------------------------------------------------------
-- SISTEMA POLÍTICO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parties (
  id          TEXT PRIMARY KEY,
  country_id  TEXT NOT NULL REFERENCES countries(id),
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  founded     INTEGER,
  ideology    TEXT NOT NULL,
  -- JSON: { property_rights: {min,max}, government_integrity: {min,max}, ... }
  value_ranges TEXT NOT NULL
);

-- Cualquier figura política: presidente, ministro, candidato
CREATE TABLE IF NOT EXISTS political_figures (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  party_id  TEXT NOT NULL REFERENCES parties(id),
  -- JSON: { property_rights: 72, government_integrity: 45, ... }
  ef_values TEXT NOT NULL
);

-- ------------------------------------------------------------
-- MINISTERIOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ministries (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT OR IGNORE INTO ministries VALUES
  ('presidente', 'Presidente'),
  ('estado',     'Ministerio de Estado'),
  ('defensa',    'Ministerio de Defensa'),
  ('economia',   'Ministerio de Economía'),
  ('inteligencia','Ministerio de Inteligencia'),
  ('energia',    'Ministerio de Energía'),
  ('interior',   'Ministerio del Interior'),
  ('trabajo',    'Ministerio de Trabajo'),
  ('salud',      'Ministerio de Salud'),
  ('educacion',  'Ministerio de Educación');

-- ------------------------------------------------------------
-- GOBIERNO POR ESCENARIO
-- Un gobierno = conjunto de roles cubiertos por figuras políticas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS government_roles (
  country_id   TEXT NOT NULL REFERENCES countries(id),
  scenario_id  TEXT NOT NULL REFERENCES scenarios(id),
  ministry_id  TEXT NOT NULL REFERENCES ministries(id),
  figure_id    TEXT NOT NULL REFERENCES political_figures(id),
  since_year   INTEGER NOT NULL,
  since_month  INTEGER NOT NULL,
  PRIMARY KEY (country_id, scenario_id, ministry_id)
);

-- ------------------------------------------------------------
-- ACCIONES
-- La lógica (apply) vive en el engine por ID.
-- Los metadatos que determinan impacto en afinidades viven acá.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actions (
  id                       TEXT PRIMARY KEY,
  ministry_id              TEXT NOT NULL REFERENCES ministries(id),
  label                    TEXT NOT NULL,
  description              TEXT NOT NULL,
  cost                     INTEGER NOT NULL DEFAULT 1,
  visibility               TEXT NOT NULL DEFAULT 'public',  -- 'public' | 'covert'
  -- Ponderación para calcular respuesta de terceros (0-100)
  weight_personal          INTEGER NOT NULL DEFAULT 50,
  weight_structural        INTEGER NOT NULL DEFAULT 50,
  -- Qué tan rápido mueve los intereses estructurales (0.0-1.0)
  structural_impact_factor REAL NOT NULL DEFAULT 0.05,
  -- JSON: delta base sobre CountryStats del target
  -- { quality_of_life, stability, economy, military, relation_to_us }
  base_target_delta        TEXT NOT NULL DEFAULT '{}',
  -- Delta base sobre popularidad del actor
  base_popularity_delta    INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- ECONOMÍA POR PAÍS Y ESCENARIO (datos semilla / iniciales)
-- ============================================================

CREATE TABLE IF NOT EXISTS country_economy_seed (
  country_id   TEXT NOT NULL REFERENCES countries(id),
  scenario_id  TEXT NOT NULL REFERENCES scenarios(id),

  -- Moneda local
  tax_revenue        REAL NOT NULL DEFAULT 0,   -- ingresos fiscales mensuales (M moneda local)
  soe_revenue        REAL NOT NULL DEFAULT 0,   -- ingresos empresas públicas (M moneda local)
  ministry_spending  REAL NOT NULL DEFAULT 0,   -- gasto total ministerios (M moneda local)
  local_debt         REAL NOT NULL DEFAULT 0,   -- deuda en moneda local acumulada
  money_supply       REAL NOT NULL DEFAULT 100, -- masa monetaria base = 100
  inflation_rate     REAL NOT NULL DEFAULT 0,   -- % mensual
  exchange_rate_regime TEXT NOT NULL DEFAULT 'float',  -- 'float' | 'fixed'
  exchange_rate      REAL NOT NULL DEFAULT 1,   -- moneda local por USD

  -- Sector externo (USD)
  reserves_usd       REAL NOT NULL DEFAULT 0,   -- reservas internacionales
  exports_usd        REAL NOT NULL DEFAULT 0,   -- exportaciones mensuales
  imports_usd        REAL NOT NULL DEFAULT 0,   -- importaciones mensuales
  external_debt_usd  REAL NOT NULL DEFAULT 0,   -- deuda externa

  -- Riesgo país
  score_historial    REAL NOT NULL DEFAULT 50,  -- 0-100, memoria histórica (cambia lento)
  default_count      INTEGER NOT NULL DEFAULT 0, -- veces que defaulteó

  PRIMARY KEY (country_id, scenario_id)
);

-- ============================================================
-- ESTADO DE PARTIDA (dinámico, se crea al iniciar juego)
-- ============================================================

CREATE TABLE IF NOT EXISTS games (
  id          TEXT PRIMARY KEY,   -- UUID
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  created_at  TEXT NOT NULL,
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL,
  popularity  INTEGER NOT NULL DEFAULT 50,
  game_over   INTEGER NOT NULL DEFAULT 0
);

-- Snapshot del estado de cada país en la partida
-- Se inicializa desde country_scenario_stats y evoluciona
CREATE TABLE IF NOT EXISTS game_country_states (
  game_id         TEXT NOT NULL REFERENCES games(id),
  country_id      TEXT NOT NULL REFERENCES countries(id),
  quality_of_life INTEGER NOT NULL,
  stability       INTEGER NOT NULL,
  economy         INTEGER NOT NULL,
  military        INTEGER NOT NULL,
  relation_to_us  INTEGER NOT NULL,
  PRIMARY KEY (game_id, country_id)
);

-- Gobierno activo en la partida (puede cambiar por muertes, renuncias, etc.)
CREATE TABLE IF NOT EXISTS game_government_roles (
  game_id      TEXT NOT NULL REFERENCES games(id),
  country_id   TEXT NOT NULL REFERENCES countries(id),
  ministry_id  TEXT NOT NULL REFERENCES ministries(id),
  figure_id    TEXT NOT NULL REFERENCES political_figures(id),
  since_year   INTEGER NOT NULL,
  since_month  INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  -- 'active' | 'dead' | 'resigned' | 'kidnapped' | 'imprisoned' | 'exiled'
  PRIMARY KEY (game_id, country_id, ministry_id)
);

-- Afinidades personales entre figuras (direccional)
CREATE TABLE IF NOT EXISTS personal_affinities (
  game_id      TEXT NOT NULL REFERENCES games(id),
  from_figure  TEXT NOT NULL REFERENCES political_figures(id),
  to_figure    TEXT NOT NULL REFERENCES political_figures(id),
  value        REAL NOT NULL,   -- 0-100
  PRIMARY KEY (game_id, from_figure, to_figure)
);

-- Intereses estructurales entre países (direccional)
CREATE TABLE IF NOT EXISTS structural_interests (
  game_id      TEXT NOT NULL REFERENCES games(id),
  from_country TEXT NOT NULL REFERENCES countries(id),
  to_country   TEXT NOT NULL REFERENCES countries(id),
  value        REAL NOT NULL,   -- 0-100
  PRIMARY KEY (game_id, from_country, to_country)
);

-- Estado económico de cada país en la partida (evoluciona cada turno)
CREATE TABLE IF NOT EXISTS game_economy (
  game_id      TEXT NOT NULL REFERENCES games(id),
  country_id   TEXT NOT NULL REFERENCES countries(id),

  -- Moneda local
  tax_revenue        REAL NOT NULL DEFAULT 0,
  soe_revenue        REAL NOT NULL DEFAULT 0,
  ministry_spending  REAL NOT NULL DEFAULT 0,
  fiscal_balance     REAL NOT NULL DEFAULT 0,   -- calculado: ingresos - egresos
  local_debt         REAL NOT NULL DEFAULT 0,
  money_supply       REAL NOT NULL DEFAULT 100,
  inflation_rate     REAL NOT NULL DEFAULT 0,
  exchange_rate_regime TEXT NOT NULL DEFAULT 'float',
  exchange_rate_official REAL NOT NULL DEFAULT 1,
  exchange_rate_parallel REAL,                  -- NULL si no hay brecha

  -- Sector externo (USD)
  reserves_usd       REAL NOT NULL DEFAULT 0,
  exports_usd        REAL NOT NULL DEFAULT 0,
  imports_usd        REAL NOT NULL DEFAULT 0,
  trade_balance      REAL NOT NULL DEFAULT 0,   -- calculado: exports - imports
  external_debt_usd  REAL NOT NULL DEFAULT 0,

  -- Riesgo país (calculado cada turno)
  country_risk       REAL NOT NULL DEFAULT 50,  -- 0-100 (100 = máximo riesgo)
  score_historial    REAL NOT NULL DEFAULT 50,
  score_macro        REAL NOT NULL DEFAULT 50,
  score_lider        REAL NOT NULL DEFAULT 50,
  default_count      INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (game_id, country_id)
);

-- Log de eventos de la partida
CREATE TABLE IF NOT EXISTS game_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id     TEXT NOT NULL REFERENCES games(id),
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL,
  message     TEXT NOT NULL,
  actor_id    TEXT,   -- figura que ejecutó la acción (nullable = evento automático)
  target_id   TEXT,   -- país o figura objetivo (nullable)
  action_id   TEXT    -- acción ejecutada (nullable = evento automático)
);
