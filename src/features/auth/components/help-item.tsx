import ArrowDown from '@expo/material-symbols/keyboard_arrow_down.xml';
import ArrowUp from '@expo/material-symbols/keyboard_arrow_up.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import type { HelpItemId } from '../hooks/use-login-help';

/** One question of the help sheet: a row with a chevron; the open one shows the answer and what to have ready. */
export function HelpItem({ id, open, onToggle }: { id: HelpItemId; open: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm} style={{ width: '100%', paddingVertical: spacing.sm + spacing.xs }}>
      <Row testID={`help-${id}`} alignment="center" onPress={onToggle} style={{ width: '100%', paddingVertical: spacing.xs }}>
        <NativeText variant="headline">{t(`auth.help.items.${id}.title`)}</NativeText>
        <Spacer flexible />
        <Icon name={{ ios: open ? 'chevron.up' : 'chevron.down', android: open ? ArrowUp : ArrowDown }} size={22} color={colors.secondaryText} />
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
  );
}
