import { router } from 'expo-router';

import { navigateOnce } from '@/shared/lib/navigation-lock';

import { authFlowActions } from '../model/auth-flow-store';

/** 잠김·정지 안내 화면의 [로그인 화면으로]: 진행 중이던 인증 흐름을 지우고 로그인으로 돌아간다. 고객센터 연락은 `SupportContactButtons`. */
export function useAccountNoticeActions() {
  const back = () =>
    navigateOnce(() => {
      authFlowActions().clear();
      if (router.canDismiss()) router.dismissAll();
      else router.replace('/sign-in');
    });

  return { back };
}
