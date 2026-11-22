import { Column } from '@expo/ui';
import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

import { REQUIRED_DIALOG } from '../components/config/required-dialog';
import { NoticePage } from '../components/notice-page';
import { useRequiredNotice } from '../hooks/use-required-notice';

/**
 * 필수 공지(서버 `required: true`): 화면 가운데 다이얼로그. 바깥(막)을 눌러도, 뒤로가기로도 닫히지 않고 [확인]으로만 닫힌다.
 * "오늘 하루 보지 않기"는 없다. 본문은 일반 공지와 같은 `NoticePage`(이미지 + 스크롤되는 제목·본문)로 그린다.
 * 폭은 창 폭에서 좌우 여백을 뺀 값과 최대 폭 중 작은 값이라 펼친 폴더블에서도 가운데 카드로 남는다.
 */
export default function NoticeRequiredScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { notice, width, maxImageHeight, pageHeight, position, confirm } = useRequiredNotice();

  if (!notice) return null;

  return (
    <View
      accessibilityViewIsModal
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: REQUIRED_DIALOG.scrim }}>
      <View style={{ width, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.background }}>
        <NoticePage key={notice.id} notice={notice} width={width} height={pageHeight} maxImageHeight={maxImageHeight} showImage />
        <NativeHost>
          <Column spacing={spacing.sm} alignment="center" style={{ width: '100%', padding: spacing.md }}>
            {position ? (
              <NativeText variant="caption" tone="secondary" tabular>
                {t('notices.position', position)}
              </NativeText>
            ) : null}
            <NativeButton testID="notice-required-confirm" label={t('notices.confirm')} onPress={confirm} />
          </Column>
        </NativeHost>
      </View>
    </View>
  );
}
