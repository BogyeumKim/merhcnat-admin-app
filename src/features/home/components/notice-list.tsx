import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { SAMPLE_NOTICES } from '../model/sample-summary';

/** The latest notices as a short list (title, date) with a link to all of them. */
export function NoticeList({ onViewAll }: { onViewAll: () => void }) {
  const { t } = useTranslation();

  return (
    <Column spacing={0} style={{ width: '100%' }}>
      <Row alignment="center" style={{ width: '100%' }}>
        <NativeText variant="headline">{t('home.notices')}</NativeText>
        <Spacer flexible />
        <Row testID="home-notices-more" onPress={onViewAll} style={{ padding: spacing.sm }}>
          <NativeText variant="subhead" tone="secondary">
            {t('home.more')}
          </NativeText>
        </Row>
      </Row>
      {SAMPLE_NOTICES.map((notice) => (
        <Row key={notice.id} alignment="center" onPress={onViewAll} style={{ width: '100%', paddingVertical: spacing.sm }}>
          <NativeText variant="body">{notice.title}</NativeText>
          <Spacer flexible />
          <NativeText variant="caption" tone="secondary">
            {notice.date}
          </NativeText>
        </Row>
      ))}
    </Column>
  );
}
