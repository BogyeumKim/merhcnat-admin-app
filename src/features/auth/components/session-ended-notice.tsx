import { SESSION_IDLE_MINUTES } from '@/shared/config/session';
import { useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { StatusHeader } from '@/shared/ui/status-header';

import { useSessionEndReason } from '../model/session-store';

/**
 * 서버가 세션을 종료함. 이유별 문구: 다른 곳의 로그인(`replaced`), 유휴 만료·세션 삭제(`expired`).
 * 버튼 하나로 로그인 폼으로 이동한다.
 */
export function SessionEndedNotice({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const reason = useSessionEndReason();

  const header =
    reason === 'replaced'
      ? { icon: icons.sessionReplaced, title: t('sessionExpired.replacedTitle'), body: t('sessionExpired.replacedBody') }
      : { icon: icons.sessionExpired, title: t('sessionExpired.title'), body: t('sessionExpired.body', { minutes: SESSION_IDLE_MINUTES }) };

  return (
    <BrandedFormScreen footer={<NativeButton testID="session-expired-signin" label={t('sessionExpired.action')} onPress={onContinue} />}>
      <StatusHeader icon={header.icon} title={header.title} body={header.body} />
    </BrandedFormScreen>
  );
}
