import { Column, Icon, Row } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { useAccountNoticeActions } from '../hooks/use-account-notice-actions';

/**
 * 인증 시트의 "등록된 연락처가 없어 인증할 수 없어요" 단계(디자인). 휴대폰·이메일 컬럼이 모두 비어 서버가
 * `MFA_REQUIRED` + 빈 `channels`를 내려준 경우다(비밀번호 통과 여부가 status로 드러나지 않도록 409 대신 같은 401로 온다).
 * 보안상 앱에서 연락처를 등록할 수 없어 고객센터 전화만 둔다.
 */
export function NoContactNotice({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { call } = useAccountNoticeActions();

  return (
    <SheetFormScreen grabber
      footer={
        <>
          <NativeButton testID="no-contact-call" label={t('auth.noContact.call')} onPress={call} />
          <NativeButton testID="no-contact-close" variant="tonal" label={t('auth.noContact.close')} onPress={onClose} />
        </>
      }>
      <Column spacing={spacing.sm} style={{ width: '100%' }}>
        <NativeText variant="title">{t('auth.noContact.title')}</NativeText>
        <NativeText tone="secondary">{t('auth.noContact.body')}</NativeText>
      </Column>
      <Row
        alignment="start"
        spacing={spacing.sm}
        style={{ width: '100%', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.warningSurface }}>
        <Icon name={icons.caution} size={18} color={colors.warning} />
        <NativeText variant="subhead">{t('auth.noContact.note')}</NativeText>
      </Row>
    </SheetFormScreen>
  );
}
