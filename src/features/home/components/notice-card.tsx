import { Column, Icon, Row, Spacer } from '@expo/ui';

import { openMenuItem } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';

import { HomeCard } from './home-card';

/** 공지 카드의 한 행: 작은 태그 칩, 문구, 쉐브론(Korpay 디자인의 공지/혜택 행). */
function TagRow({ tag, text, testID, onPress }: { tag: string; text: string; testID: string; onPress: () => void }) {
  const colors = useNativeColors();

  return (
    <Row testID={testID} alignment="center" spacing={spacing.md} onPress={onPress} modifiers={pressableA11y()} style={{ width: '100%', paddingVertical: spacing.xs }}>
      <Column style={{ paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.tonal }}>
        <NativeText variant="caption">{tag}</NativeText>
      </Column>
      <NativeText variant="body">{text}</NativeText>
      <Spacer flexible />
      <Icon name={icons.chevronRight} size={18} color={colors.secondaryText} />
    </Row>
  );
}

/** 최신 공지와 이번 달 카드 할부 혜택을 한 장의 흰 카드에 태그 행으로 하나씩 보여준다. */
export function NoticeCard({ latestNoticeTitle }: { latestNoticeTitle?: string }) {
  const { t } = useTranslation();

  return (
    <HomeCard>
      {latestNoticeTitle ? (
        <TagRow tag={t('home.noticeTag')} text={latestNoticeTitle} testID="home-notices" onPress={() => openMenuItem('notices')} />
      ) : null}
      <TagRow tag={t('home.benefitTag')} text={t('home.benefitTitle')} testID="home-benefits" onPress={() => openMenuItem('benefits')} />
    </HomeCard>
  );
}
