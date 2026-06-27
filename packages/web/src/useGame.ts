import { useCallback, useState } from "react";
import {
  createInitialState,
  applyAction,
  advanceTurn,
  type GameState,
  type Country,
} from "@shadow-president/engine";

export function useGame(initialCountries?: Record<string, Country>) {
  const [state, setState] = useState<GameState>(() => {
    const base = createInitialState();
    if (!initialCountries) return base;
    return {
      ...base,
      countries: {
        ...initialCountries,
        // USA siempre viene del engine (es el jugador)
        USA: base.countries["USA"],
      },
    };
  });
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const doAction = useCallback((actionId: string, targetCountryId: string) => {
    setState((prev) => {
      const outcome = applyAction({ state: prev, actionId, targetCountryId });
      setLastMessage(outcome.message);
      return outcome.state;
    });
  }, []);

  const nextTurn = useCallback(() => {
    setState((prev) => advanceTurn(prev));
  }, []);

  const restart = useCallback(() => {
    const base = createInitialState();
    setState({
      ...base,
      countries: initialCountries
        ? { ...initialCountries, USA: base.countries["USA"] }
        : base.countries,
    });
    setLastMessage(null);
  }, [initialCountries]);

  return { state, doAction, nextTurn, restart, lastMessage };
}
