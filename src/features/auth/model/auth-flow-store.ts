import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import type { ChallengeRequired } from './schemas';

type State = { challenge: ChallengeRequired | null };

const initialState: State = { challenge: null };

/** The in-progress additional-authentication step. Memory only; cleared on sign-in, sign-out and cancel. */
const useAuthFlowStore = create(
  combine(initialState, (set) => ({
    actions: {
      start: (challenge: ChallengeRequired) => set({ challenge }),
      clear: () => set({ challenge: null }),
    },
  })),
);

export const useAuthChallenge = () => useAuthFlowStore((store) => store.challenge);
export const useAuthFlowActions = () => useAuthFlowStore((store) => store.actions);

/** For non-React code (session completion). */
export const authFlowActions = () => useAuthFlowStore.getState().actions;
