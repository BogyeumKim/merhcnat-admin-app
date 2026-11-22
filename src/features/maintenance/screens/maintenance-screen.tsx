import { useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';
import { getCurrentLanguage, useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';

import { formatRemaining } from '../model/maintenance';

/** 언어별로 한 번만 만든다: `Intl.DateTimeFormat` 생성은 비싸고, 점검 화면은 남은 시간 갱신으로 다시 렌더링될 수 있다. */
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(language: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(language);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit' });
    dateFormatters.set(language, formatter);
  }
  return formatter;
}

function formatDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return dateFormatter(getCurrentLanguage()).format(date);
}

/** 서버 점검 중에 앱을 막는다. 점검 시간대를 구조화된 필드로 받아 앱 언어로 포맷해 보여준다(서버가 준 문장은 쓰지 않음). */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const { startAt, endAt } = useLocalSearchParams<{ startAt?: string; endAt?: string }>();
  const from = formatDate(startAt);
  const until = formatDate(endAt);
  const remaining = formatRemaining(endAt, t);

  useBlockBackButton();

  const rows = [
    ...(from ? [{ label: t('maintenance.start'), value: from }] : []),
    ...(until ? [{ label: t('maintenance.end'), value: until }] : []),
    ...(remaining ? [{ label: t('maintenance.remaining'), value: remaining }] : []),
  ];

  return (
    <BrandedFormScreen
      footer={
        <NativeButton
          testID="maintenance-call"
          variant="tonal"
          label={t('maintenance.call', { phone: SUPPORT.display })}
          onPress={() => void Linking.openURL(`tel:${SUPPORT.phone}`)}
        />
      }>
      <StatusHeader icon={icons.maintenance} title={t('maintenance.title')} body={t('maintenance.body')} />
      {rows.length > 0 ? <InfoRows rows={rows} /> : null}
      <NativeText tone="secondary">{t('maintenance.reopen')}</NativeText>
    </BrandedFormScreen>
  );
}
