import { useEffect, useState } from 'react';

const secondsUntil = (endAt: number) => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));

/**
 * `endAt`(epoch ms)까지 남은 정수 초이며 1초마다 갱신된다. 틱 횟수를 세지 않고 종료 시각으로 계산하므로
 * 앱이 백그라운드에 있었어도 정확하다. `endAt`이 바뀌면(다시 받기) 같은 렌더에서 새 종료 시각 기준으로 다시 시작한다:
 * 0초에서 멈춘 타이머도 새 시각으로 살아난다(`key` 없이 같은 컴포넌트가 계속 써도 된다).
 */
export function useSecondsLeft(endAt: number): number {
  const [tick, setTick] = useState(() => ({ endAt, left: secondsUntil(endAt) }));
  // 이전 종료 시각 값을 렌더 중에 바로잡는다(React 권장 "이전 prop 저장" 패턴): 한 프레임이라도 이전 값을 보이지 않게.
  const current = tick.endAt === endAt ? tick : { endAt, left: secondsUntil(endAt) };
  if (current !== tick) setTick(current);
  const secondsLeft = current.left;

  // 틱마다 새 객체라 타이머가 일찍 깨어 같은 초가 나와도 다음 타이머를 다시 건다.
  useEffect(() => {
    if (tick.left <= 0) return;
    const timer = setTimeout(() => setTick({ endAt: tick.endAt, left: secondsUntil(tick.endAt) }), 1000);
    return () => clearTimeout(timer);
  }, [tick]);

  return secondsLeft;
}

/** 185 -> "3:05". */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
