import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';

import { authFlowActions, useAuthChallenge, useAuthFlowId } from '../model/auth-flow-store';
import { useIsSignedIn } from '../model/session-store';

/**
 * 인증 시트와 메모리 속 challenge를 함께 맞추고, 시트 렌더에 필요한 값을 반환한다.
 * 시트를 닫는 방법(취소, 아래로 드래그, Android 뒤로 가기 제스처, 로그인 완료)과 무관하게 미완료
 * challenge도 함께 지운다. `removed`는 화면이 언마운트된 뒤 발생하므로 거기서 지워도 아래 리다이렉트가 발동하지 않으며,
 * 이벤트 문서에 따라 구독 해제는 다음 microtask까지 기다린다.
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

  // 대기 중인 challenge 없이 열림(예: 오래된 딥링크): 로그인으로 돌아간다.
  useEffect(() => {
    if (!challenge && !isSignedIn) router.replace('/sign-in');
  }, [challenge, isSignedIn]);

  return { challenge, flowId };
}
