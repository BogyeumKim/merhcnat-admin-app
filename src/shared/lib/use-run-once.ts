import { useRef } from 'react';

/**
 * Returns a runner that lets one operation be in flight at a time. It blocks a second tap/Enter that arrives before React
 * re-renders with the mutation's `isPending`. `start` receives `done`, which must be called when the operation settles.
 */
export function useRunOnce() {
  const inFlight = useRef(false);

  return (start: (done: () => void) => void) => {
    if (inFlight.current) return;
    inFlight.current = true;
    start(() => {
      inFlight.current = false;
    });
  };
}
