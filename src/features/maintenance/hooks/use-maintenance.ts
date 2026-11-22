import { router, useLocalSearchParams } from 'expo-router';

import { getCurrentLanguage } from '@/shared/i18n';
import { navigateOnce } from '@/shared/lib/navigation-lock';

import { formatMaintenanceDate } from '../model/maintenance';

/**
 * 점검 화면의 동작: 시작·종료 예정 시각(앱 언어로 포맷)과 [로그인 화면으로]. 점검 사유나 서버 문구는 보여주지 않는다(문구는 모두 i18n).
 * 파라미터 이름은 503 `MAINTENANCE` `data`(`startedAt`/`endsAt`)와 같다(`shared/api/blocking-error-route.ts`가 검증해 넘김).
 * [로그인 화면으로]: 기기 시각은 믿을 수 없고 점검 여부는 서버가 정하므로 종료 시각으로 막지 않고 항상 로그인 화면으로 간다
 * (뒤로가기가 아니다). 점검이 계속되면 다음 요청(로그인)이 같은 오류(`MAINTENANCE`)로 다시 이 화면을 띄운다.
 * 로그인 중에 받은 점검은 이미 세션을 끝내고 스택을 이 화면 하나로 바꿨으므로(`core/navigation/route-blocking-error.ts`)
 * 로그인으로 교체하고, 로그인 전에는 이 화면 아래의 로그인 화면까지 닫는다(인증 시트가 있었으면 함께 닫힌다).
 */
export function useMaintenance() {
  const { startedAt, endsAt } = useLocalSearchParams<{ startedAt?: string; endsAt?: string }>();
  const language = getCurrentLanguage();

  return {
    from: formatMaintenanceDate(startedAt, language),
    until: formatMaintenanceDate(endsAt, language),
    goToSignIn: () => {
      navigateOnce(() => {
        if (router.canDismiss()) router.dismissTo('/sign-in');
        else router.replace('/sign-in');
      });
    },
  };
}
