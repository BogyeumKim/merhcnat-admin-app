import { Column, Row, Spacer } from '@expo/ui';

import { SUPPORT } from '@/shared/config/support';
import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { FILL_ROW } from '@/shared/ui/fill-row';
import { IconButton } from '@/shared/ui/icon-button';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { HelpItem } from '../components/help-item';
import { TOP_BAR_GLYPH } from '../components/top-bar';
import { HELP_ITEMS, useLoginHelp } from '../hooks/use-login-help';

/**
 * "로그인이 안 되나요?": 흔한 로그인 문제를 아코디언으로 보여주고, 하단에 고객센터 전화를 둔다.
 * 닫기는 그래버(아래로 끌기)와 머리 오른쪽 X 둘 다 둔다: X는 스와이프의 한 번 탭 대안(WCAG 2.5.1).
 */
export default function LoginHelpScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { open, toggle, call, close } = useLoginHelp();

  return (
    <SheetFormScreen grabber
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
        <Column spacing={spacing.xs} modifiers={FILL_ROW}>
          <NativeText variant="title">{t('auth.help.title')}</NativeText>
          <NativeText tone="secondary">{t('auth.help.subtitle')}</NativeText>
        </Column>
        <IconButton icon={icons.close} size={TOP_BAR_GLYPH} weight="medium" color={colors.text} testID="help-close" label={t('auth.verify.close')} onPress={close} />
      </Row>
      <Column style={{ width: '100%' }}>
        {HELP_ITEMS.map((id) => (
          <HelpItem key={id} id={id} open={open === id} onToggle={() => toggle(id)} />
        ))}
      </Column>
    </SheetFormScreen>
  );
}
