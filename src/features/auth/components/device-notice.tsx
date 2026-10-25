import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import type { DeviceState } from '../model/schemas';

type DeviceNoticeProps = {
  state: Exclude<DeviceState, 'MATCH'>;
  onContinue: () => void;
  onCancel: () => void;
};

/** Shown before additional authentication when the device is new (`NONE`) or replaces another one (`CHANGED`). */
export function DeviceNotice({ state, onContinue, onCancel }: DeviceNoticeProps) {
  const { t } = useTranslation();
  const isChange = state === 'CHANGED';

  return (
    <>
      <NativeText variant="title">
        {isChange ? t('auth.verify.deviceChangedTitle') : t('auth.verify.deviceNewTitle')}
      </NativeText>
      <NativeText tone="secondary">
        {isChange ? t('auth.verify.deviceChangedBody') : t('auth.verify.deviceNewBody')}
      </NativeText>
      <NativeButton label={t('common.continue')} onPress={onContinue} />
      <NativeButton label={t('common.cancel')} variant="text" onPress={onCancel} />
    </>
  );
}
