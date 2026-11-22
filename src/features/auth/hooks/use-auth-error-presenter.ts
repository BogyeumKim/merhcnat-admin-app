import { router } from 'expo-router';

import { updateRequiredHref } from '@/features/app-gate';
import { maintenanceHref } from '@/features/maintenance';
import { presentationOf } from '@/shared/api/error-presentation';
import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { showErrorToast } from '@/shared/ui/toast';

import { accountLockedHref } from '../model/locked';

type AuthErrorHandlers = {
  /** 화면 안에 유지되는 오류(폼 알림, 필드 오류). */
  onInline: (error: ApiError) => void;
};

/**
 * 인증 단계 실패를 어디에 보여줄지는 종류(`presentationOf`)에 따라 다르다. 점검과 잠긴 계정은 전용 화면,
 * 일시적 오류는 토스트(코드당 id 하나라 반복돼도 토스트 하나만 갱신), 나머지는 인라인으로 표시한다.
 * 화면은 "인라인"이 자기에게 무엇인지만 알려주면 된다.
 */
export function useAuthErrorPresenter({ onInline }: AuthErrorHandlers) {
  const { t } = useTranslation();

  return (error: ApiError) => {
    switch (presentationOf(error.code)) {
      case 'maintenance':
        router.push(maintenanceHref(error));
        return;
      case 'update':
        router.push(updateRequiredHref(error));
        return;
      case 'insecure':
        router.push('/insecure-device');
        return;
      case 'locked':
        router.push(accountLockedHref(error));
        return;
      case 'suspended':
        router.push('/account-suspended');
        return;
      case 'toast':
        showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
        return;
      case 'inline':
        onInline(error);
        return;
    }
  };
}
