import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import { HomeCard } from './home-card';

/** 수치를 불러오는 중이거나, 실패했는데 보여줄 캐시도 없을 때 알려주는 카드(실패 시 다시 시도 버튼 제공). */
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
