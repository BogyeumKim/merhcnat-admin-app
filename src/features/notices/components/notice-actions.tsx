import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

type NoticeActionsProps = { onHideToday: () => void; onClose: () => void; bottomInset: number };

/**
 * 공지 시트의 하단 영역. 한국 앱 팝업처럼 헤어라인 아래 한 행에 "오늘 하루 보지 않기"는
 * 왼쪽에 차분한 톤으로, "닫기"는 오른쪽에 더 강한 톤으로 둔다. 양쪽 모두 전체 높이가 터치 영역이다.
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
            modifiers={pressableA11y()}
            style={{ width: '49.5%', paddingVertical: spacing.md }}>
            <NativeText tone="secondary">{t('notices.hideToday')}</NativeText>
          </Column>
          <Column style={{ width: 1, height: 20, backgroundColor: colors.tonal }}>
            <Spacer />
          </Column>
          <Column testID="notice-close" alignment="center" onPress={onClose} modifiers={pressableA11y()} style={{ width: '49.5%', paddingVertical: spacing.md }}>
            <NativeText variant="headline">{t('notices.close')}</NativeText>
          </Column>
        </Row>
      </Column>
    </NativeHost>
  );
}
