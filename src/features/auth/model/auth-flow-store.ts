import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import { clearChallengeToken } from './challenge-vault';
import type { ChallengeRequired } from './schemas';

type State = {
  challenge: ChallengeRequired | null;
  /** Changes for every new challenge, so the verification screen starts from its first step again. */
  flowId: number;
};

const initialState: State = { challenge: null, flowId: 0 };

/**
 * The in-progress additional-authentication step (what the server asked for, not secrets). Memory only; cleared on
 * sign-in, sign-out and cancel. Clearing it also drops the held challenge token (`challenge-vault`).
 */
const useAuthFlowStore = create(
  combine(initialState, (set) => ({
    actions: {
      start: (challenge: ChallengeRequired) => set((state) => ({ challenge, flowId: state.flowId + 1 })),
      clear: () => {
        clearChallengeToken();
        set({ challenge: null });
      },
    },
  })),
);

export const useAuthChallenge = () => useAuthFlowStore((store) => store.challenge);
export const useAuthFlowId = () => useAuthFlowStore((store) => store.flowId);
export const useAuthFlowActions = () => useAuthFlowStore((store) => store.actions);

/** For non-React code (session completion). */
export const authFlowActions = () => useAuthFlowStore.getState().actions;
