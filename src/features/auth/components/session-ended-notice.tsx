import { SESSION_IDLE_MINUTES } from '@/shared/config/session';
import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';

import { useSessionEndReason } from '../model/session-store';

/**
 * 서버가 세션을 끝냄(디자인 1-14 자동 로그아웃). 로그인 화면이 폼 대신 이 차단 화면을 먼저 그린다: 로그아웃(`signOutLocally`)은
 * 이미 끝났고, [다시 로그인하기]는 안내만 지워 같은 자리에 로그인 폼을 드러낸다(별도 라우트 없이 기존 흐름 유지).
 * 이유별 문구: 다른 곳의 로그인(`replaced`), 그 외 유휴 만료·세션 삭제·알 수 없는 401(`expired`, 디자인 문구).
 * Android 뒤로가기는 앱 종료(차단 화면 공통).
 */
export function SessionEndedNotice({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const reason = useSessionEndReason();

  useBlockBackButton(true, 'exit');

  const header =
    reason === 'replaced'
      ? { icon: icons.sessionReplaced, title: t('sessionExpired.replacedTitle'), body: t('sessionExpired.replacedBody') }
      : { icon: icons.sessionExpired, title: t('sessionExpired.title'), body: t('sessionExpired.body', { minutes: SESSION_IDLE_MINUTES }) };

  return (
    <BlockingScreenLayout
      icon={header.icon}
      title={header.title}
      description={header.body}
      actions={<NativeButton testID="session-expired-signin" label={t('sessionExpired.action')} onPress={onContinue} />}
    />
  );
}
