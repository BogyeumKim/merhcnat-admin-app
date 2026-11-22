import { useRef } from 'react';

/**
 * 한 번에 하나의 작업만 진행되게 하는 러너를 반환한다. React가 mutation의 `isPending`으로 다시 렌더링하기 전에
 * 들어오는 두 번째 탭/Enter를 막는다. `start`는 `done`을 받으며, 작업이 끝나면 반드시 호출해야 한다.
 * `start`가 동기적으로 던지면 잠금을 풀고 다시 던진다(그러지 않으면 버튼이 영구히 먹통이 된다).
 */
export function useRunOnce() {
  const inFlight = useRef(false);

  return (start: (done: () => void) => void) => {
    if (inFlight.current) return;
    inFlight.current = true;
    const done = () => {
      inFlight.current = false;
    };
    try {
      start(done);
    } catch (error) {
      done();
      throw error;
    }
  };
}
