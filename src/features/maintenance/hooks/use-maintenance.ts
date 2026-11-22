import { router, useLocalSearchParams } from 'expo-router';

import { getCurrentLanguage, useTranslation } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';
import { showInfoToast } from '@/shared/ui/toast';

import { endsInFuture, formatMaintenanceDate } from '../model/maintenance';

/**
 * 점검 화면의 동작: 시작·종료 예정 시각(앱 언어로 포맷)과 [홈으로]. 점검 사유나 서버 문구는 보여주지 않는다(문구는 모두 i18n).
 * 파라미터 이름은 503 `MAINTENANCE` `data`(`startedAt`/`endsAt`)와 같다(`shared/api/blocking-error-route.ts`가 검증해 넘김).
 * [홈으로]: 점검 상태만 확인하는 서버 API가 없으므로 종료 예정 시각으로 먼저 판단한다. 아직 남았으면 토스트로 알리고
 * 그대로 두고, 지났거나 모르면 로그인 화면으로 간다(뒤로가기가 아니다). 로그인 중에 받은 점검은 이미 세션을 끝내고 스택을 이 화면
 * 하나로 바꿨으므로(`core/navigation/route-blocking-error.ts`) 로그인으로 교체하고, 로그인 전에는 이 화면 아래의 로그인 화면까지
 * 닫는다(인증 시트가 있었으면 함께 닫힌다). 점검이 계속되면 다음 요청이 같은 오류(`MAINTENANCE`)로 다시 이 화면을 띄운다.
 */
export function useMaintenance() {
  const { t } = useTranslation();
  const { startedAt, endsAt } = useLocalSearchParams<{ startedAt?: string; endsAt?: string }>();
  const language = getCurrentLanguage();

  return {
    from: formatMaintenanceDate(startedAt, language),
    until: formatMaintenanceDate(endsAt, language),
    goHome: () => {
      if (endsInFuture(endsAt)) {
        showInfoToast({ id: 'maintenance:ongoing', title: t('maintenance.stillOngoing') });
        return;
      }
      navigateOnce(() => {
        if (router.canDismiss()) router.dismissTo('/sign-in');
        else router.replace('/sign-in');
      });
    },
  };
}
