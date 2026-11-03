import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

import { getCurrentLanguage, useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { NativeText } from '@/shared/ui/native-text';

function formatDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(getCurrentLanguage(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/** Blocks the app while the server is under maintenance. Shows the window from structured fields, formatted in the app language (never a server sentence). */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const { startAt, endAt } = useLocalSearchParams<{ startAt?: string; endAt?: string }>();
  const from = formatDate(startAt);
  const until = formatDate(endAt);

  // Nothing on this screen leads anywhere: the Android back button is swallowed and the route has no swipe-to-dismiss.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  return (
    <BrandedFormScreen>
      <NativeText variant="title">{t('maintenance.title')}</NativeText>
      <NativeText tone="secondary">{t('maintenance.body')}</NativeText>
      {from || until ? (
        <>
          <NativeText variant="headline">{t('maintenance.period')}</NativeText>
          {from ? <NativeText>{t('maintenance.from', { date: from })}</NativeText> : null}
          {until ? <NativeText>{t('maintenance.until', { date: until })}</NativeText> : null}
        </>
      ) : null}
      <NativeText tone="secondary">{t('maintenance.reopen')}</NativeText>
    </BrandedFormScreen>
  );
}
