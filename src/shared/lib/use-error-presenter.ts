import { router } from 'expo-router';

import { blockingErrorRoute } from '@/shared/api/blocking-error-route';
import { presentationOf } from '@/shared/api/error-presentation';
import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { showErrorToast } from '@/shared/ui/toast';

type ErrorPresenterHandlers = {
  /** 화면 안에 유지되는 오류(폼 알림, 필드 오류). */
  onInline: (error: ApiError) => void;
};

/**
 * 사용자 동작(mutation, 수동 새로고침)이 실패했을 때 어디에 보여줄지는 종류(`presentationOf`)에 따라 다르다.
 * 차단 오류(점검, 업데이트, 보안 위험 기기, 잠김, 정지)는 전용 화면, 일시적 오류는 토스트(코드당 id 하나라 반복돼도
 * 토스트 하나만 갱신), 나머지는 인라인. 화면은 "인라인"이 자기에게 무엇인지만 알려주면 된다.
 * 로그인 후 쿼리의 차단 오류는 `core/providers/query-provider.tsx`의 `QueryCache.onError`가 한 곳에서 처리하므로
 * 쿼리 결과에는 이 훅을 다시 쓰지 않는다(중복 이동 방지).
 */
export function useErrorPresenter({ onInline }: ErrorPresenterHandlers) {
  const { t } = useTranslation();

  return (error: ApiError) => {
    const blocking = blockingErrorRoute(error);
    if (blocking) {
      router.push(blocking.href);
      return;
    }
    if (presentationOf(error.code) === 'toast') {
      showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
      return;
    }
    onInline(error);
  };
}
