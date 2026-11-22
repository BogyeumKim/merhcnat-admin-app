import * as Application from 'expo-application';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { showErrorToast } from '@/shared/ui/toast';

import { compareVersions, openStore } from '../model/update';

/**
 * 필수 업데이트 화면의 동작: 현재/최신 버전, 스토어 열기(실패하면 토스트), 앱으로 돌아오면 버전 다시 확인.
 * 다시 확인: 버전만 알려주는 서버 API가 없어(보류) 426 `data`의 최소 버전(`min`, 없으면 최신 `latest`)과 설치된 버전을 비교한다.
 * 이미 최신이면 이 화면을 닫아 이전 화면으로 돌아가고, 서버가 여전히 막으면 다음 요청이 `UPDATE_REQUIRED`로 다시 띄운다.
 * (대부분 스토어 업데이트는 앱 프로세스를 다시 시작하므로 실제로는 새 실행에서 로그인부터 다시 확인된다.)
 * 화면(`update-required-screen.tsx`)은 렌더링만 한다.
 */
export function useUpdateRequired() {
  const { t } = useTranslation();
  const { latest, min } = useLocalSearchParams<{ latest?: string; min?: string }>();
  const required = min ?? latest;
  const current = Application.nativeApplicationVersion ?? '';

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !required || !current) return;
      if (compareVersions(current, required) < 0) return;
      navigateOnce(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/sign-in');
      });
    });
    return () => subscription.remove();
  }, [current, required]);

  return {
    current,
    latest,
    update: async () => {
      if (!(await openStore())) showErrorToast({ id: 'update:store', title: t('updateRequired.storeUnavailable') });
    },
  };
}
