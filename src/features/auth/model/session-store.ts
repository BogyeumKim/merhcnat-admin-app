import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { ApiError } from '@/shared/api/errors';
import { getAccessToken, setAccessToken, setUnauthorizedHandler } from '@/shared/api/session-token';

import { authFlowActions } from './auth-flow-store';
import type { UserType } from './user-type';

type State = { userType: UserType | null };

const initialState: State = { userType: null };

/**
 * Signed-in state. The access token itself is NOT here: it lives in memory in `shared/api/session-token`
 * so the API client can read and replace it. Nothing in this store is ever persisted.
 */
const useSessionStore = create(
  combine(initialState, (set) => ({
    actions: {
      signIn: (userType: UserType) => set({ userType }),
      clear: () => set({ userType: null }),
    },
  })),
);

/** `userType` can be `0` (a valid type), so signed-in is `!== null`, never truthiness. */
export function useSession() {
  return useSessionStore(
    useShallow((store) => ({ userType: store.userType, isSignedIn: store.userType !== null })),
  );
}

export const useIsSignedIn = () => useSessionStore((store) => store.userType !== null);

const signOutHandlers = new Set<() => void>();

/** Lets outer layers react to sign-out (for example clearing the query cache) without features importing them. */
export function registerSignOutHandler(handler: () => void) {
  signOutHandlers.add(handler);
  return () => signOutHandlers.delete(handler);
}

/** An `AUTHENTICATED` response without the token header is a broken contract: refuse to sign in on it. */
export function assertTokenIssued() {
  if (getAccessToken() === null) throw new ApiError({ status: 200, code: 'INVALID_RESPONSE' });
}

/** Called once authentication fully succeeded (the token is already in memory). */
export function completeSignIn(userType: UserType) {
  authFlowActions().clear();
  useSessionStore.getState().actions.signIn(userType);
}

/** Local sign-out: drop the token, the session and any pending challenge, then let handlers clean up. */
export function signOutLocally() {
  setAccessToken(null);
  authFlowActions().clear();
  useSessionStore.getState().actions.clear();
  signOutHandlers.forEach((handler) => handler());
}

// A 401 on a request that carried a token ends the session.
setUnauthorizedHandler(signOutLocally);
