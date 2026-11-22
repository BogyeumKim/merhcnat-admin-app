import * as Application from 'expo-application';
import { useLocalSearchParams } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { showErrorToast } from '@/shared/ui/toast';

import { openStore } from '../model/update';

/**
 * 필수 업데이트 화면의 동작: 뒤로가기 차단, 현재/최신 버전, 스토어 열기(실패하면 토스트).
 * 화면(`update-required-screen.tsx`)은 렌더링만 한다.
 */
export function useUpdateRequired() {
  const { t } = useTranslation();
  const { latest } = useLocalSearchParams<{ latest?: string }>();

  useBlockBackButton();

  return {
    current: Application.nativeApplicationVersion ?? '',
    latest,
    update: async () => {
      if (!(await openStore())) showErrorToast({ id: 'update:store', title: t('updateRequired.storeUnavailable') });
    },
  };
}
