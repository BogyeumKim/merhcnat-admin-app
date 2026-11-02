import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { StepHeader } from './step-header';
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
    <SheetFormScreen
      footer={
        <>
          <NativeButton testID="device-continue" label={t('common.continue')} onPress={onContinue} />
          <NativeButton testID="verify-cancel" label={t('common.cancel')} variant="text" onPress={onCancel} />
        </>
      }>
      <StepHeader
        title={isChange ? t('auth.verify.deviceChangedTitle') : t('auth.verify.deviceNewTitle')}
        body={isChange ? t('auth.verify.deviceChangedBody') : t('auth.verify.deviceNewBody')}
      />
    </SheetFormScreen>
  );
}
