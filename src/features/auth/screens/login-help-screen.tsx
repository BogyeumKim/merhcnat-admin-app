import { Column, Row, Spacer } from '@expo/ui';

import { SUPPORT } from '@/shared/config/support';
import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { HelpItem } from '../components/help-item';
import { HELP_ITEMS, useLoginHelp } from '../hooks/use-login-help';

/** "로그인이 안 되나요?": the common sign-in problems as an accordion, with the customer-center call at the bottom. */
export default function LoginHelpScreen() {
  const { t } = useTranslation();
  const { open, toggle, close, call } = useLoginHelp();

  return (
    <SheetFormScreen
      footer={
        <Column spacing={spacing.sm} style={{ width: '100%' }}>
          <Row alignment="center" style={{ width: '100%' }}>
            <NativeText variant="headline">{t('auth.supportPhone', { phone: SUPPORT.display })}</NativeText>
            <Spacer flexible />
            <NativeText variant="caption" tone="secondary">
              {t('auth.supportHours', SUPPORT.hours)}
            </NativeText>
          </Row>
          <NativeButton testID="help-call" label={t('auth.help.call')} onPress={call} />
        </Column>
      }>
      <Row alignment="start" style={{ width: '100%' }}>
        <Column spacing={spacing.xs}>
          <NativeText variant="title">{t('auth.help.title')}</NativeText>
          <NativeText tone="secondary">{t('auth.help.subtitle')}</NativeText>
        </Column>
        <Spacer flexible />
        <Column testID="help-close" onPress={close} style={{ padding: spacing.sm }}>
          <NativeText variant="label" tone="secondary">
            {t('auth.verify.close')}
          </NativeText>
        </Column>
      </Row>
      <Column style={{ width: '100%' }}>
        {HELP_ITEMS.map((id) => (
          <HelpItem key={id} id={id} open={open === id} onToggle={() => toggle(id)} />
        ))}
      </Column>
    </SheetFormScreen>
  );
}
