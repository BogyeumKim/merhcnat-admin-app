import { Column, Row } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { FILL_ROW } from '@/shared/ui/fill-row';
import { IconButton } from '@/shared/ui/icon-button';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';
import { SupportContactButtons } from '@/shared/ui/support-contact-buttons';

import { HelpItem } from '../components/help-item';
import { TOP_BAR_GLYPH } from '../components/top-bar';
import { HELP_ITEMS, useLoginHelp } from '../hooks/use-login-help';

/**
 * "로그인이 안 되나요?": 흔한 로그인 문제를 아코디언(한 번에 하나만 펼침)으로 보여주고, 하단에 고객센터 연락([카카오톡 상담] [전화 상담])을 고정한다.
 * 목록은 스크롤되고 연락 버튼은 `footer`라 스크롤되지 않는다.
 * 닫기는 그래버(아래로 끌기)와 머리 오른쪽 X 둘 다 둔다: X는 스와이프의 한 번 탭 대안(WCAG 2.5.1).
 */
export default function LoginHelpScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { open, toggle, close } = useLoginHelp();

  return (
    <SheetFormScreen grabber footer={<SupportContactButtons header />}>
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
