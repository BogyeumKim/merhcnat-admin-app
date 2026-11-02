import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';

/** The figures are loading, or failed with nothing cached to show: a card that says so (a failure offers a retry). */
export function SummaryStatus({ failed, onRetry }: { failed: boolean; onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <HomeCard>
      <NativeText variant={failed ? 'headline' : 'subhead'} tone="secondary">
        {failed ? t('home.loadFailed') : t('home.loading')}
      </NativeText>
      {failed ? <NativeButton testID="home-retry" variant="outlined" label={t('home.retry')} onPress={onRetry} /> : null}
    </HomeCard>
  );
}
