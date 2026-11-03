import PhoneUpload from '@expo/material-symbols/upload.xml';

import { useTranslation } from '@/shared/i18n';
import { NativeButton } from '@/shared/ui/native-button';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { StepHeader } from './step-header';

type DeviceNoticeProps = {
  onContinue: () => void;
  onCancel: () => void;
};

/** Shown when this account's device replaces another one (`CHANGED`). A new device goes straight to the method choice. */
export function DeviceNotice({ onContinue, onCancel }: DeviceNoticeProps) {
  const { t } = useTranslation();

  return (
    <SheetFormScreen
      footer={
        <>
          <NativeButton testID="device-continue" label={t('auth.verify.deviceChange')} onPress={onContinue} />
          <NativeButton testID="verify-cancel" variant="tonal" label={t('auth.verify.close')} onPress={onCancel} />
        </>
      }>
      <StepHeader
        icon={{ ios: 'iphone.and.arrow.forward', android: PhoneUpload }}
        title={t('auth.verify.deviceChangedTitle')}
        body={t('auth.verify.deviceChangedBody')}
      />
    </SheetFormScreen>
  );
}
