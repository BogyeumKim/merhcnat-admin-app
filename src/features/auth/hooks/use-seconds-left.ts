import { useEffect, useState } from 'react';

const secondsUntil = (endAt: number) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

/**
 * `endAt`(epoch ms)까지 남은 정수 초이며 1초마다 갱신된다. 틱 횟수를 세지 않고 종료 시각으로 계산하므로
 * 앱이 백그라운드에 있었어도 정확하다. 컴포넌트에 `endAt`을 `key`로 주면 새 종료 시각에서
 * 이전 값이 잠깐 보이지 않고 새 값으로 시작한다.
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
