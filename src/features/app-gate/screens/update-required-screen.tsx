import { Icon, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';

import { useUpdateRequired } from '../hooks/use-update-required';

/** 업데이트 전까지 앱을 막는다(`UPDATE_REQUIRED`). 유일한 진행 방법은 스토어이며 뒤로가기, 스와이프, 건너뛰기가 없다. 동작은 `useUpdateRequired`에 있다. */
export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { current, latest, update } = useUpdateRequired();

  return (
    <BrandedFormScreen footer={<NativeButton testID="update-store" label={t('updateRequired.action')} onPress={update} />}>
      <StatusHeader tone="action" icon={icons.download} title={t('updateRequired.title')} body={t('updateRequired.body')} />
      <Row
        alignment="center"
        spacing={spacing.md}
        style={{ width: '100%', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
        <Spacer flexible />
        <NativeText variant="subhead" tone="secondary">
          {t('updateRequired.current', { version: current })}
        </NativeText>
        {latest ? (
          <>
            <Icon name={icons.arrowRight} size={16} color={colors.secondaryText} />
            <NativeText variant="label">{t('updateRequired.latest', { version: latest })}</NativeText>
          </>
        ) : null}
        <Spacer flexible />
      </Row>
    </BrandedFormScreen>
  );
}
