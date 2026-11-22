import { Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import { useUpdateRequired } from '../hooks/use-update-required';

/**
 * 업데이트 전까지 앱을 막는다(`UPDATE_REQUIRED`, 디자인 1-12). "지금 1.0.0 → 최신 1.1.0" 카드와 [업데이트하기](스토어)뿐이며
 * 건너뛰기가 없다. 스토어에서 돌아오면 버전을 다시 확인한다. Android 뒤로가기는 앱 종료. 동작은 `useUpdateRequired`.
 */
export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { current, latest, update } = useUpdateRequired();

  useBlockBackButton(true, 'exit');

  return (
    <BlockingScreenLayout
      icon={icons.download}
      tone="action"
      title={t('updateRequired.title')}
      description={t('updateRequired.body')}
      details={
        <Row
          alignment="center"
          spacing={spacing.md}
          style={{ width: '100%', padding: spacing.md + spacing.xs, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
          <Spacer flexible />
          <NativeText variant="subhead" tone="secondary" tabular>
            {t('updateRequired.current', { version: current })}
          </NativeText>
          {latest ? (
            <>
              <Icon name={icons.arrowRight} size={16} color={colors.secondaryText} />
              <NativeText variant="label" tabular>
                {t('updateRequired.latest', { version: latest })}
              </NativeText>
            </>
          ) : null}
          <Spacer flexible />
        </Row>
      }
      actions={<NativeButton testID="update-store" label={t('updateRequired.action')} onPress={update} />}
    />
  );
}
