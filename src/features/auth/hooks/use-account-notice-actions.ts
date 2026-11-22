import { router } from 'expo-router';
import { Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';
import { navigateOnce } from '@/shared/lib/navigation-lock';

import { authFlowActions } from '../model/auth-flow-store';

/** 잠김·정지 안내 화면의 공통 동작: 고객센터 전화, 로그인으로 돌아가기. */
export function useAccountNoticeActions() {
  const back = () =>
    navigateOnce(() => {
      authFlowActions().clear();
      if (router.canDismiss()) router.dismissAll();
      else router.replace('/sign-in');
    });
  const call = () => {
    void Linking.openURL(`tel:${SUPPORT.phone}`);
  };

  return { back, call };
}
