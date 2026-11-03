import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import { Column, Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';
import type { HomeSummary } from '../model/schemas';

/** "내 가맹점": the status chip and four label/value rows. */
export function StoreInfoCard({ store, onMore }: { store: NonNullable<HomeSummary['store']>; onMore: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const rows = [
    { label: t('home.bizNo'), value: store.bizNo },
    { label: t('home.settlementCycle'), value: store.settlementCycle },
    { label: t('home.settlementAccount'), value: store.settlementAccount },
    { label: t('home.services'), value: store.services },
  ];

  return (
    <HomeCard>
      <Row testID="home-store-more" alignment="center" spacing={spacing.sm} onPress={onMore} style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.myStore')}</NativeText>
        {store.normal ? (
          <Column style={{ paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.tonal }}>
            <NativeText variant="caption">{t('home.storeNormal')}</NativeText>
          </Column>
        ) : null}
        <Spacer flexible />
        <NativeText variant="caption" tone="secondary">
          {t('home.storeMore')}
        </NativeText>
        <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />
      </Row>
      {rows.map((row) => (
        <Row key={row.label} alignment="center" style={{ width: '100%', paddingVertical: spacing.xs }}>
          <NativeText variant="subhead" tone="secondary">
            {row.label}
          </NativeText>
          <Spacer flexible />
          <NativeText variant="label">{row.value}</NativeText>
        </Row>
      ))}
    </HomeCard>
  );
}
