import type { ActionDefinition, Country } from "./types.js";

/**
 * Clamp helper: mantiene cualquier stat dentro del rango 0-100.
 */
export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Acciones disponibles en v0.1. Deliberadamente pocas — la idea es
 * tener el loop completo funcionando antes de sumar más variedad.
 */
export const ACTIONS: ActionDefinition[] = [
  {
    id: "condemn",
    category: "diplomatic",
    label: "Condenar públicamente",
    description:
      "Declaración pública criticando las acciones del país objetivo.",
    cost: 0,
    apply: (_target: Country) => ({
      targetDelta: { relationToUS: -10 },
      popularityDelta: 1,
      message: "condenado públicamente por Estados Unidos",
    }),
  },
  {
    id: "praise",
    category: "diplomatic",
    label: "Elogiar / fortalecer lazos",
    description: "Declaración pública de apoyo y buena relación.",
    cost: 0,
    apply: (_target: Country) => ({
      targetDelta: { relationToUS: 8 },
      popularityDelta: 0,
      message: "recibió elogios públicos de Estados Unidos",
    }),
  },
  {
    id: "send_humanitarian_aid",
    category: "economic",
    label: "Enviar ayuda humanitaria",
    description: "Transferencia de recursos para mejorar calidad de vida.",
    cost: 15,
    apply: (_target: Country) => ({
      targetDelta: { qualityOfLife: 6, relationToUS: 12 },
      popularityDelta: -1,
      message: "recibió ayuda humanitaria de Estados Unidos",
    }),
  },
  {
    id: "trade_embargo",
    category: "economic",
    label: "Imponer embargo comercial",
    description: "Corta el comercio con el país objetivo, dañando su economía.",
    cost: 5,
    apply: (_target: Country) => ({
      targetDelta: { economy: -15, relationToUS: -15 },
      popularityDelta: 2,
      message: "sufrió un embargo comercial de Estados Unidos",
    }),
  },
  {
    id: "lift_embargo",
    category: "economic",
    label: "Levantar embargo / favorecer comercio",
    description: "Restablece relaciones comerciales normales o preferenciales.",
    cost: 5,
    apply: (_target: Country) => ({
      targetDelta: { economy: 10, relationToUS: 10 },
      popularityDelta: -1,
      message: "recuperó relaciones comerciales con Estados Unidos",
    }),
  },
  {
    id: "military_aid",
    category: "military",
    label: "Enviar ayuda militar",
    description: "Equipamiento y entrenamiento para fortalecer al país objetivo.",
    cost: 20,
    apply: (_target: Country) => ({
      targetDelta: { militaryStrength: 12, relationToUS: 10 },
      popularityDelta: -2,
      message: "recibió ayuda militar de Estados Unidos",
    }),
  },
  {
    id: "deploy_troops",
    category: "military",
    label: "Desplegar tropas (presión militar)",
    description:
      "Movimiento de tropas como señal de fuerza. No es invasión todavía.",
    cost: 30,
    apply: (_target: Country) => ({
      targetDelta: { stability: -8, relationToUS: -10 },
      popularityDelta: 3,
      message: "vio tropas estadounidenses desplegadas en la región",
    }),
  },
];

export function getAction(id: string): ActionDefinition | undefined {
  return ACTIONS.find((a) => a.id === id);
}
