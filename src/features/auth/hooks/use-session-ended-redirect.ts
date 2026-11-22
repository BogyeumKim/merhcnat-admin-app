import { router } from 'expo-router';
import { useEffect } from 'react';

import { useSessionEnded } from '../model/session-store';

/**
 * 서버가 세션을 종료하면 로그인 후 화면이 사라지고 스택이 항상 접근 가능한 아무 라우트에 떨어지므로(로그인이 아님),
 * 로그인으로 명시적으로 보내야 한다. 루트 네비게이터에서 한 번만 호출한다.
 */
export function useSessionEndedRedirect() {
  const ended = useSessionEnded();

  useEffect(() => {
    if (ended) router.replace('/sign-in');
  }, [ended]);
}
