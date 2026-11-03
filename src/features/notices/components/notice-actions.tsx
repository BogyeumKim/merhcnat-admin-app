import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

type NoticeActionsProps = { onHideToday: () => void; onClose: () => void; bottomInset: number };

/**
 * The footer of the notice sheet, laid out like the popups of Korean apps: one row under a hairline, "don't show today"
 * on the left in a quiet tone and "close" on the right in the stronger one. Both halves are full-height touch targets.
 */
export function NoticeActions({ onHideToday, onClose, bottomInset }: NoticeActionsProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <NativeHost>
      <Column style={{ width: '100%', paddingBottom: bottomInset }}>
        <Column style={{ width: '100%', height: 1, backgroundColor: colors.tonal }}>
          <Spacer />
        </Column>
        <Row alignment="center" style={{ width: '100%' }}>
          <Column
            testID="notice-hide-today"
            alignment="center"
            onPress={onHideToday}
            style={{ width: '49.5%', paddingVertical: spacing.md }}>
            <NativeText tone="secondary">{t('notices.hideToday')}</NativeText>
          </Column>
          <Column style={{ width: 1, height: 20, backgroundColor: colors.tonal }}>
            <Spacer />
          </Column>
          <Column testID="notice-close" alignment="center" onPress={onClose} style={{ width: '49.5%', paddingVertical: spacing.md }}>
            <NativeText variant="headline">{t('notices.close')}</NativeText>
          </Column>
        </Row>
      </Column>
    </NativeHost>
  );
}
