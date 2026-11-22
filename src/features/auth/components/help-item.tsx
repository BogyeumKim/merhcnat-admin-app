import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { Divider } from '@/shared/ui/divider';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

import type { HelpItemId } from '../hooks/use-login-help';

/**
 * 도움말 시트의 질문 하나: 위쪽 헤어라인 + 쉐브론이 있는 행이며, 열린 항목은 답변과 준비물을 보여준다.
 * 쉐브론은 열리면 위를 향한다(디자인 1-3 "화살표가 위로 돌아감").
 */
export function HelpItem({ id, open, onToggle }: { id: HelpItemId; open: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column style={{ width: '100%' }}>
    <Divider color={colors.hairline} />
    <Column spacing={spacing.sm} style={{ width: '100%', paddingVertical: spacing.sm + spacing.xs }}>
      <Row testID={`help-${id}`} alignment="center" onPress={onToggle} modifiers={pressableA11y()} style={{ width: '100%', paddingVertical: spacing.xs }}>
        <NativeText variant="headline">{t(`auth.help.items.${id}.title`)}</NativeText>
        <Spacer flexible />
        <Icon name={open ? icons.chevronUp : icons.chevronDown} size={22} color={colors.secondaryText} />
      </Row>
      {open ? (
        <>
          <NativeText tone="secondary">{t(`auth.help.items.${id}.body`)}</NativeText>
          <Row>
            <Column style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.tonal }}>
              <NativeText variant="caption">{t(`auth.help.items.${id}.prepare`)}</NativeText>
            </Column>
          </Row>
        </>
      ) : null}
    </Column>
    </Column>
  );
}
