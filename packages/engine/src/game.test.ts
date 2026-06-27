import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialState, applyAction, advanceTurn } from "./game.js";

test("el estado inicial arranca en 1990, popularidad 50", () => {
  const state = createInitialState();
  assert.equal(state.year, 1990);
  assert.equal(state.month, 6);
  assert.equal(state.popularity, 50);
  assert.equal(state.gameOver, false);
});

test("aplicar 'condemn' baja la relación del país objetivo", () => {
  const state = createInitialState();
  const before = state.countries["IRQ"].stats.relationToUS;
  const outcome = applyAction({
    state,
    actionId: "condemn",
    targetCountryId: "IRQ",
  });
  assert.equal(outcome.success, true);
  const after = outcome.state.countries["IRQ"].stats.relationToUS;
  assert.ok(after < before, "la relación debería bajar tras condenar");
});

test("no se puede aplicar una acción contra USA (el jugador)", () => {
  const state = createInitialState();
  const outcome = applyAction({
    state,
    actionId: "condemn",
    targetCountryId: "USA",
  });
  assert.equal(outcome.success, false);
});

test("una acción con id inválido falla sin romper el estado", () => {
  const state = createInitialState();
  const outcome = applyAction({
    state,
    actionId: "no_existe",
    targetCountryId: "IRQ",
  });
  assert.equal(outcome.success, false);
  assert.deepEqual(outcome.state, state);
});

test("advanceTurn avanza el mes y el año correctamente", () => {
  let state = createInitialState(); // mes 6
  state = advanceTurn(state);
  assert.equal(state.month, 7);
  assert.equal(state.year, 1990);
});

test("advanceTurn cruza de diciembre a enero del año siguiente", () => {
  let state = createInitialState();
  state = { ...state, month: 12 };
  state = advanceTurn(state);
  assert.equal(state.month, 1);
  assert.equal(state.year, 1991);
});

test("los stats nunca superan el rango 0-100", () => {
  let state = createInitialState();
  // Aplicamos ayuda humanitaria muchas veces para forzar el techo.
  for (let i = 0; i < 20; i++) {
    const outcome = applyAction({
      state,
      actionId: "send_humanitarian_aid",
      targetCountryId: "SOM",
    });
    state = outcome.state;
  }
  const som = state.countries["SOM"];
  assert.ok(som.stats.qualityOfLife <= 100);
  assert.ok(som.stats.relationToUS <= 100);
});
