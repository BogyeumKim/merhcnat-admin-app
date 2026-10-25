import { router, useLocalSearchParams } from 'expo-router';

import { getCurrentLanguage, useTranslation } from '@/shared/i18n';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

function formatDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(getCurrentLanguage(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/** Shows the maintenance window from structured fields, formatted in the app language (never a server sentence). */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const { startAt, endAt } = useLocalSearchParams<{ startAt?: string; endAt?: string }>();
  const from = formatDate(startAt);
  const until = formatDate(endAt);

  const back = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/sign-in');
  };

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
      <NativeButton label={t('maintenance.back')} onPress={back} />
    </BrandedFormScreen>
  );
}
