import { INITIAL_COUNTRIES } from "./data/countries.js";
import { getAction, clamp } from "./actions.js";
import type { GameState, GameEvent } from "./types.js";

/** Cuántos puntos de "presupuesto de acción" se asignan cada turno. */
const ACTION_BUDGET_PER_TURN = 100;

export function createInitialState(): GameState {
  return {
    year: 1990,
    month: 6,
    popularity: 50,
    countries: structuredClone(INITIAL_COUNTRIES),
    eventLog: [
      {
        year: 1990,
        month: 6,
        message:
          "Asumís la presidencia de Estados Unidos. El mundo observa tus primeros movimientos.",
      },
    ],
    gameOver: false,
  };
}

export interface ApplyActionParams {
  state: GameState;
  actionId: string;
  targetCountryId: string;
}

export interface ApplyActionOutcome {
  state: GameState;
  success: boolean;
  message: string;
}

/**
 * Aplica una acción sobre un país objetivo. No avanza el turno —
 * eso lo hace `advanceTurn` por separado, así el jugador puede hacer
 * varias acciones en el mismo turno antes de pasar de mes.
 */
export function applyAction({
  state,
  actionId,
  targetCountryId,
}: ApplyActionParams): ApplyActionOutcome {
  const action = getAction(actionId);
  if (!action) {
    return { state, success: false, message: `Acción desconocida: ${actionId}` };
  }

  const target = state.countries[targetCountryId];
  const player = state.countries["USA"];
  if (!target || !player) {
    return {
      state,
      success: false,
      message: `País objetivo inválido: ${targetCountryId}`,
    };
  }

  if (target.isPlayer) {
    return {
      state,
      success: false,
      message: "No podés dirigir acciones contra Estados Unidos.",
    };
  }

  const result = action.apply(target, player);

  const updatedTarget = {
    ...target,
    stats: {
      qualityOfLife: clamp(
        target.stats.qualityOfLife + (result.targetDelta.qualityOfLife ?? 0)
      ),
      stability: clamp(
        target.stats.stability + (result.targetDelta.stability ?? 0)
      ),
      economy: clamp(target.stats.economy + (result.targetDelta.economy ?? 0)),
      militaryStrength: clamp(
        target.stats.militaryStrength + (result.targetDelta.militaryStrength ?? 0)
      ),
      relationToUS: clamp(
        target.stats.relationToUS + (result.targetDelta.relationToUS ?? 0)
      ),
    },
  };

  const newEvent: GameEvent = {
    year: state.year,
    month: state.month,
    message: `${target.name} ${result.message}.`,
  };

  const newState: GameState = {
    ...state,
    popularity: clamp(state.popularity + result.popularityDelta),
    countries: {
      ...state.countries,
      [targetCountryId]: updatedTarget,
    },
    eventLog: [...state.eventLog, newEvent],
  };

  return { state: newState, success: true, message: newEvent.message };
}

/**
 * Avanza el juego un mes. Aplica deriva natural a los países
 * (estabilidad/economía tienden a regresar a un equilibrio lento)
 * y chequea condiciones de fin de juego (reelección cada 4 años).
 */
export function advanceTurn(state: GameState): GameState {
  let { year, month } = state;
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }

  const events: GameEvent[] = [];

  // Deriva natural: países muy inestables tienden a empeorar un poco
  // si no se interviene; es lo que crea presión para actuar.
  const updatedCountries = { ...state.countries };
  for (const [id, country] of Object.entries(state.countries)) {
    if (country.isPlayer) continue;
    const drift = country.stats.stability < 30 ? -1 : 0;
    if (drift !== 0) {
      updatedCountries[id] = {
        ...country,
        stats: {
          ...country.stats,
          stability: clamp(country.stats.stability + drift),
        },
      };
    }
  }

  let gameOver = state.gameOver;
  // Elección cada 4 años, en noviembre, como en el original.
  if (month === 11 && year % 4 === 0) {
    const reelected = state.popularity >= 45;
    events.push({
      year,
      month,
      message: reelected
        ? "¡Fuiste reelecto! El país continúa bajo tu liderazgo."
        : "No fuiste reelecto. Tu mandato termina aquí.",
    });
    gameOver = !reelected;
  }

  return {
    ...state,
    year,
    month,
    countries: updatedCountries,
    eventLog: [...state.eventLog, ...events],
    gameOver,
  };
}

export { ACTIONS } from "./actions.js";
export { INITIAL_COUNTRIES } from "./data/countries.js";
export const ACTION_BUDGET = ACTION_BUDGET_PER_TURN;
export type * from "./types.js";
