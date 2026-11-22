import { presentationOf } from '@/shared/api/error-presentation';
import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { showErrorToast } from '@/shared/ui/toast';

import { navigateToBlockingScreen } from './blocking-navigation';

type ErrorPresenterHandlers = {
  /** 화면 안에 유지되는 오류(폼 알림, 필드 오류). */
  onInline: (error: ApiError) => void;
};

/**
 * 사용자 동작(mutation, 수동 새로고침)이 실패했을 때 어디에 보여줄지는 종류(`presentationOf`)에 따라 다르다.
 * 차단 오류(점검, 업데이트, 보안 위험 기기, 잠김, 정지)는 전용 화면, 일시적 오류는 토스트(코드당 id 하나라 반복돼도
 * 토스트 하나만 갱신), 나머지는 인라인. 화면은 "인라인"이 자기에게 무엇인지만 알려주면 된다.
 * 차단 오류 이동은 `navigateToBlockingScreen`(core가 등록) 한 경로다: 로그인 후 mutation은 `MutationCache.onError`가 먼저
 * 처리하고(로그아웃 + 스택 초기화), 여기서는 중복 방지에 걸려 이동도 토스트도 하지 않는다. 쿼리 결과에는 이 훅을 쓰지 않는다
 * (`QueryCache.onError`가 처리).
 */
export function useErrorPresenter({ onInline }: ErrorPresenterHandlers) {
  const { t } = useTranslation();

  return (error: ApiError) => {
    if (navigateToBlockingScreen(error)) return;
    if (presentationOf(error.code) === 'toast') {
      showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
      return;
    }
    onInline(error);
  };
}
