import { useEffect, useState } from 'react';

const secondsUntil = (endAt: number) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

/**
 * Whole seconds until `endAt` (epoch ms), ticking once a second. It is computed from the end time, not by counting
 * ticks, so it stays correct after the app was in the background. Give the component a `key` of `endAt`: a new end
 * time then starts from a fresh value instead of showing the old one for a moment.
 */
export function useSecondsLeft(endAt: number): number {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(endAt));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsUntil(endAt)), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, endAt]);

  return secondsLeft;
}

/** 185 -> "3:05". */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
