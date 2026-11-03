import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';

import { authFlowActions, useAuthChallenge, useAuthFlowId } from '../model/auth-flow-store';
import { useIsSignedIn } from '../model/session-store';

/**
 * Keeps the verification sheet and the in-memory challenge in step, and returns what the sheet needs to render.
 * Whatever closes the sheet (Cancel, dragging it down, the Android back gesture, a finished sign-in), the half-finished
 * challenge goes with it. `removed` fires after the screen unmounted, so clearing there cannot trigger the redirect below;
 * per the event's docs the unsubscription waits for the next microtask.
 */
export function useVerifyRouteGuard() {
  const challenge = useAuthChallenge();
  const flowId = useAuthFlowId();
  const isSignedIn = useIsSignedIn();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('removed', () => authFlowActions().clear());
    return () => queueMicrotask(unsubscribe);
  }, [navigation]);

  // Opened without a pending challenge (for example a stale deep link): go back to sign-in.
  useEffect(() => {
    if (!challenge && !isSignedIn) router.replace('/sign-in');
  }, [challenge, isSignedIn]);

  return { challenge, flowId };
}
