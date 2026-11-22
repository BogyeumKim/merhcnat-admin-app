import { Icon, Row, Spacer } from '@expo/ui';
import * as Application from 'expo-application';
import { useLocalSearchParams } from 'expo-router';

import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { BrandedFormScreen } from '@/shared/ui/branded-form-screen';
import { icons } from '@/shared/ui/icons';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';
import { showErrorToast } from '@/shared/ui/toast';

import { openStore } from '../model/update';

/** 업데이트 전까지 앱을 막는다(`UPDATE_REQUIRED`). 유일한 진행 방법은 스토어이며 뒤로가기, 스와이프, 건너뛰기가 없다. */
export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { latest } = useLocalSearchParams<{ latest?: string }>();

  useBlockBackButton();

  const update = async () => {
    if (!(await openStore())) showErrorToast({ id: 'update:store', title: t('updateRequired.storeUnavailable') });
  };

  return (
    <BrandedFormScreen footer={<NativeButton testID="update-store" label={t('updateRequired.action')} onPress={update} />}>
      <StatusHeader tone="action" icon={icons.download} title={t('updateRequired.title')} body={t('updateRequired.body')} />
      <Row
        alignment="center"
        spacing={spacing.md}
        style={{ width: '100%', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
        <Spacer flexible />
        <NativeText variant="subhead" tone="secondary">
          {t('updateRequired.current', { version: Application.nativeApplicationVersion ?? '' })}
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
