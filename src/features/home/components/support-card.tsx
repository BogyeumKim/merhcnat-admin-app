import Campaign from '@expo/material-symbols/campaign.xml';
import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import Help from '@expo/material-symbols/help.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { openMenuItem, type MenuItemId } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { IconBadge } from './amount-row';
import { HomeCard } from './home-card';

const ROWS = [
  { id: 'notices', icon: { ios: 'megaphone.fill', android: Campaign } },
  { id: 'faq', icon: { ios: 'questionmark.circle.fill', android: Help } },
] as const satisfies readonly { id: MenuItemId; icon: { ios: string; android: unknown } }[];

/** Notices and FAQ as list rows with a leading icon and a chevron (the "내 대출 관리 >" list card of the reference apps). */
export function SupportCard({ latestNoticeTitle }: { latestNoticeTitle?: string }) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <HomeCard title={t('home.support')}>
      {ROWS.map((row) => (
        <Row
          key={row.id}
          testID={`home-${row.id}`}
          alignment="center"
          spacing={spacing.md}
          onPress={() => openMenuItem(row.id)}
          style={{ width: '100%', paddingVertical: spacing.xs }}>
          <IconBadge icon={row.icon} />
          <Column spacing={2}>
            <NativeText variant="body">{t(`menu.items.${row.id}.title`)}</NativeText>
            {row.id === 'notices' && latestNoticeTitle ? (
              <NativeText variant="caption" tone="secondary">
                {latestNoticeTitle}
              </NativeText>
            ) : null}
          </Column>
          <Spacer flexible />
          <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
        </Row>
      ))}
    </HomeCard>
  );
}
