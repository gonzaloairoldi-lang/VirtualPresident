import { useCallback, useState } from "react";
import {
  createInitialState,
  applyAction,
  advanceTurn,
  type GameState,
} from "@shadow-president/engine";

export function useGame() {
  const [state, setState] = useState<GameState>(() => createInitialState());
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
    setState(createInitialState());
    setLastMessage(null);
  }, []);

  return { state, doAction, nextTurn, restart, lastMessage };
}
