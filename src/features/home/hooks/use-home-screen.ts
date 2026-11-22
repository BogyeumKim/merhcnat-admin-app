import { router } from 'expo-router';

import { openMenuItem } from '@/features/menu';
import { presentationOf } from '@/shared/api/error-presentation';
import { asApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { useRunOnce } from '@/shared/lib/use-run-once';
import { showErrorToast } from '@/shared/ui/toast';

import { useHomeSummaryData } from '../queries/use-home-summary-data';

/**
 * 홈 화면의 동작: 수치 조회 상태, 새로고침(실패 시 캐시는 유지하고 토스트로 알림), 이동.
 * 화면(`home-screen.tsx`)은 렌더링만 한다.
 */
export function useHomeScreen() {
  const { t } = useTranslation();
  const { data: summary, isError, isRefetching, dataUpdatedAt, refetch } = useHomeSummaryData();
  // 새로고침·다시 시도 연타 잠금. `isRefetching`은 다시 렌더링된 뒤에야 바뀌고, `refetch()`는 기본값(`cancelRefetch: true`)이
  // 진행 중 요청을 취소하고 새로 보내므로 두 번째 탭이 요청을 또 만든다.
  const runOnce = useRunOnce();

  const refresh = () =>
    runOnce((done) => {
      void refetch()
        .then((result) => {
          // 처음 불러오기 실패는 `SummaryStatus`가 지속 표시한다. 캐시가 있는 상태의 새로고침 실패만 일시 알림으로 알린다.
          if (!result.isError || result.data === undefined) return;
          const error = asApiError(result.error);
          if (presentationOf(error.code) === 'toast') showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
        })
        .finally(done);
    });

  return {
    summary,
    /** 보여줄 캐시도 없이 실패했다(첫 로딩 실패). 로딩 중과 구분해 "다시 시도"를 보여준다. */
    failed: isError && summary === undefined,
    refreshing: isRefetching,
    updatedAt: dataUpdatedAt,
    refresh,
    retry: () => runOnce((done) => void refetch().finally(done)),
    openTransactions: () => navigateOnce(() => router.navigate('/transactions')),
    openStores: () => navigateOnce(() => router.navigate('/stores')),
    openNotices: () => openMenuItem('notices'),
    openFailedTransactions: () => openMenuItem('failedTransactions'),
  };
}
