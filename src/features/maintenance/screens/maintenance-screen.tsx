import Build from '@expo/material-symbols/build.xml';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

import { getCurrentLanguage, useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';

import { formatRemaining } from '../model/maintenance';

function formatDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(getCurrentLanguage(), { month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(date);
}

/** Blocks the app while the server is under maintenance. Shows the window from structured fields, formatted in the app language (never a server sentence). */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const { startAt, endAt } = useLocalSearchParams<{ startAt?: string; endAt?: string }>();
  const from = formatDate(startAt);
  const until = formatDate(endAt);
  const remaining = formatRemaining(endAt, t);

  // Nothing on this screen leads anywhere: the Android back button is swallowed and the route has no swipe-to-dismiss.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const rows = [
    ...(from ? [{ label: t('maintenance.start'), value: from }] : []),
    ...(until ? [{ label: t('maintenance.end'), value: until }] : []),
    ...(remaining ? [{ label: t('maintenance.remaining'), value: remaining }] : []),
  ];

  return (
    <BrandedFormScreen>
      <StatusHeader icon={{ ios: 'wrench.and.screwdriver', android: Build }} title={t('maintenance.title')} body={t('maintenance.body')} />
      {rows.length > 0 ? <InfoRows rows={rows} /> : null}
      <NativeText tone="secondary">{t('maintenance.reopen')}</NativeText>
    </BrandedFormScreen>
  );
}
