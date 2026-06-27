/**
 * Motor económico bimonetario.
 * Todas las funciones son puras — reciben estado y devuelven valores nuevos.
 */

export interface EconomyState {
  // Moneda local
  tax_revenue: number;
  soe_revenue: number;
  ministry_spending: number;
  fiscal_balance: number;
  local_debt: number;
  money_supply: number;
  inflation_rate: number;
  exchange_rate_regime: "float" | "fixed";
  exchange_rate_official: number;
  exchange_rate_parallel: number | null;

  // Sector externo (USD)
  reserves_usd: number;
  exports_usd: number;
  imports_usd: number;
  trade_balance: number;
  external_debt_usd: number;

  // Riesgo país
  country_risk: number;
  score_historial: number;
  score_macro: number;
  score_lider: number;
  default_count: number;
}

export interface EconomicFreedomValues {
  property_rights: number;
  government_integrity: number;
  judicial_effectiveness: number;
  tax_burden: number;
  government_spending: number;
  fiscal_health: number;
  business_freedom: number;
  labor_freedom: number;
  monetary_freedom: number;
  trade_freedom: number;
  investment_freedom: number;
  financial_freedom: number;
}

// ── Score del líder (qué tan confiable es para los mercados) ──────────────
export function calcScoreLider(values: EconomicFreedomValues): number {
  return (
    values.property_rights * 0.25 +
    values.fiscal_health * 0.20 +
    values.monetary_freedom * 0.20 +
    values.government_integrity * 0.15 +
    values.business_freedom * 0.10 +
    values.investment_freedom * 0.10
  );
}

// ── Score macro (situación objetiva del país este turno) ──────────────────
export function calcScoreMacro(eco: EconomyState): number {
  const ingresos = eco.tax_revenue + eco.soe_revenue;
  const deficitRatio = ingresos > 0
    ? Math.max(0, (eco.ministry_spending - ingresos) / ingresos)
    : 1;

  const debtReservesRatio = eco.reserves_usd > 0
    ? Math.min(eco.external_debt_usd / eco.reserves_usd / 10, 1)
    : 1;

  const inflationPenalty = Math.min(eco.inflation_rate / 30, 1);

  const brechaPenalty = eco.exchange_rate_parallel != null
    ? Math.min(
        (eco.exchange_rate_parallel - eco.exchange_rate_official) /
          eco.exchange_rate_official,
        1
      )
    : 0;

  const score =
    100 -
    deficitRatio * 30 -
    debtReservesRatio * 25 -
    inflationPenalty * 25 -
    brechaPenalty * 20;

  return Math.max(0, Math.min(100, score));
}

// ── Riesgo país final (ponderado) ─────────────────────────────────────────
export function calcCountryRisk(
  score_historial: number,
  score_macro: number,
  score_lider: number
): number {
  const score = 0.50 * score_historial + 0.30 * score_macro + 0.20 * score_lider;
  // Riesgo = inversa del score (score alto = país confiable = bajo riesgo)
  return Math.max(0, Math.min(100, 100 - score));
}

// ── Tipo de cambio flotante ───────────────────────────────────────────────
export function calcExchangeRate(
  eco: EconomyState,
  initial_money_supply: number,
  initial_reserves: number,
  initial_exchange_rate: number
): number {
  const emisionFactor = eco.money_supply / initial_money_supply;
  const reservasFactor = initial_reserves > 0 && eco.reserves_usd > 0
    ? initial_reserves / eco.reserves_usd
    : 2;
  const inflacionAcumulada = 1 + eco.inflation_rate / 100;
  const expectativasFactor = 1 + (eco.country_risk - 50) / 200;

  return (
    initial_exchange_rate *
    emisionFactor *
    reservasFactor *
    inflacionAcumulada *
    expectativasFactor
  );
}

// ── Tipo de cambio paralelo (si hay régimen fijo con brecha) ──────────────
export function calcExchangeParallel(
  tc_mercado: number,
  tc_oficial: number
): number | null {
  const brecha = (tc_mercado - tc_oficial) / tc_oficial;
  // Brecha mayor al 10% genera mercado paralelo
  if (brecha > 0.10) return tc_mercado;
  return null;
}

// ── Inflación del próximo turno ───────────────────────────────────────────
export function calcInflacion(eco: EconomyState): number {
  const fiscal_balance = (eco.tax_revenue + eco.soe_revenue) - eco.ministry_spending;
  const emisionPresion = fiscal_balance < 0
    ? Math.abs(fiscal_balance) / (eco.tax_revenue + eco.soe_revenue + 0.001) * 5
    : 0;
  const brecha = eco.exchange_rate_parallel != null
    ? (eco.exchange_rate_parallel - eco.exchange_rate_official) /
      eco.exchange_rate_official * 3
    : 0;

  const nueva = eco.inflation_rate * 0.85 + emisionPresion + brecha;
  return Math.max(0, Math.min(100, nueva));
}

// ── Avanzar economía un turno ─────────────────────────────────────────────
export function advanceEconomy(
  eco: EconomyState,
  liderValues: EconomicFreedomValues,
  initial: { money_supply: number; reserves_usd: number; exchange_rate: number }
): EconomyState {
  const fiscal_balance =
    (eco.tax_revenue + eco.soe_revenue) - eco.ministry_spending;

  // Si hay déficit, se emite moneda local (aumenta money_supply)
  const nueva_money_supply =
    fiscal_balance < 0
      ? eco.money_supply * (1 + Math.abs(fiscal_balance) / (eco.tax_revenue + eco.soe_revenue + 0.001) * 0.1)
      : eco.money_supply;

  const nueva_inflacion = calcInflacion({ ...eco, money_supply: nueva_money_supply });

  const score_lider = calcScoreLider(liderValues);
  const score_macro = calcScoreMacro(eco);

  // score_historial cambia muy lento (0.5% por turno hacia score_macro)
  const nuevo_historial =
    eco.score_historial * 0.995 + score_macro * 0.005;

  const country_risk = calcCountryRisk(nuevo_historial, score_macro, score_lider);

  const trade_balance = eco.exports_usd - eco.imports_usd;
  const nueva_reservas = eco.reserves_usd + trade_balance;

  let nuevo_tc_oficial = eco.exchange_rate_official;
  let nuevo_tc_paralelo = eco.exchange_rate_parallel;

  if (eco.exchange_rate_regime === "float") {
    nuevo_tc_oficial = calcExchangeRate(
      { ...eco, country_risk, inflation_rate: nueva_inflacion },
      initial.money_supply,
      initial.reserves_usd,
      initial.exchange_rate
    );
    nuevo_tc_paralelo = null;
  } else {
    // Tipo fijo: el mercado igual presiona, aparece paralelo si hay brecha
    const tc_mercado = calcExchangeRate(
      { ...eco, country_risk, inflation_rate: nueva_inflacion },
      initial.money_supply,
      initial.reserves_usd,
      initial.exchange_rate
    );
    nuevo_tc_paralelo = calcExchangeParallel(tc_mercado, eco.exchange_rate_official);
  }

  return {
    ...eco,
    fiscal_balance,
    local_debt: eco.local_debt + (fiscal_balance < 0 ? Math.abs(fiscal_balance) : 0),
    money_supply: nueva_money_supply,
    inflation_rate: nueva_inflacion,
    exchange_rate_official: nuevo_tc_oficial,
    exchange_rate_parallel: nuevo_tc_paralelo,
    reserves_usd: Math.max(0, nueva_reservas),
    trade_balance,
    score_lider,
    score_macro,
    score_historial: nuevo_historial,
    country_risk,
  };
}
