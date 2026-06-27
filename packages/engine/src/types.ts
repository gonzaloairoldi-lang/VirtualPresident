/**
 * Tipos centrales del motor de Shadow President.
 *
 * Convención: todos los valores normalizados (popularidad, estabilidad,
 * relación, calidad de vida) van de 0 a 100. Donde el original usaba
 * conceptos más vagos, acá los hacemos explícitos y documentados.
 */

/** Postura diplomática de un país hacia EE.UU., de hostil a aliado. */
export type RelationLevel =
  | "hostile"
  | "unfriendly"
  | "neutral"
  | "friendly"
  | "allied";

export interface CountryStats {
  /** 0-100. Calidad de vida promedio de la población. */
  qualityOfLife: number;
  /** 0-100. Qué tan estable es el gobierno actual (bajo = riesgo de golpe/revuelta). */
  stability: number;
  /** 0-100. Fuerza económica relativa. */
  economy: number;
  /** 0-100. Capacidad militar relativa. */
  militaryStrength: number;
  /** 0-100. Qué tan bien ve este país a EE.UU. */
  relationToUS: number;
}

export interface Country {
  /** Código ISO 3166-1 alpha-3, ej "USA", "IRQ", "KWT". */
  id: string;
  name: string;
  /** Región geopolítica, usada para agrupar y para efectos en cadena. */
  region: Region;
  stats: CountryStats;
  /** true si este país es el del jugador (EE.UU.). */
  isPlayer?: boolean;
}

export type Region =
  | "north_america"
  | "south_america"
  | "europe"
  | "middle_east"
  | "africa"
  | "asia"
  | "oceania";

/** Categorías de acción, tal como en el juego original. */
export type ActionCategory =
  | "diplomatic"
  | "economic"
  | "covert"
  | "military";
// Nota: "nuclear" se agrega en una capa posterior; no existe todavía.

export interface ActionDefinition {
  id: string;
  category: ActionCategory;
  label: string;
  description: string;
  /** Costo en puntos de presupuesto/acción para este turno. */
  cost: number;
  /** Efecto a aplicar sobre el país objetivo y, opcionalmente, sobre el jugador. */
  apply: (target: Country, player: Country) => ActionResult;
}

export interface ActionResult {
  /** Cambios a aplicar sobre el país objetivo (delta, no valor absoluto). */
  targetDelta: Partial<CountryStats>;
  /** Cambios sobre la popularidad del jugador (-100 a +100). */
  popularityDelta: number;
  /** Mensaje descriptivo del resultado, para mostrar en el log de eventos. */
  message: string;
}

export interface GameState {
  /** Año actual de la simulación, arranca en 1990 como el original. */
  year: number;
  month: number;
  /** Popularidad del jugador, 0-100. Empieza en 50. */
  popularity: number;
  /** Todos los países, incluyendo EE.UU. */
  countries: Record<string, Country>;
  /** Historial de eventos para mostrar en el log del juego. */
  eventLog: GameEvent[];
  /** Si el juego terminó (no reelecto, etc). */
  gameOver: boolean;
}

export interface GameEvent {
  year: number;
  month: number;
  message: string;
}
