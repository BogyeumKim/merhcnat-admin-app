
import { useTranslation } from '@/shared/i18n';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { StepHeader } from './step-header';
import { maskUserId } from '../model/mask-user-id';

type DeviceNoticeProps = {
  /** 이 기기에 등록된 계정(서버가 마스킹). 없으면 서버가 알려주지 않은 것. */
  registeredUserId?: string;
  /** 로그인 화면에서 방금 입력한 ID. */
  enteredUserId?: string;
  /** 이 기기가 다른 계정에 등록돼 있음: 서버는 그 계정을 알려주지 않는다(아이디 노출 방지). */
  otherAccount?: boolean;
  onContinue: () => void;
  onCancel: () => void;
};

/**
 * 이 계정의 기기가 다른 기기를 대체할 때(`CHANGED`) 표시한다. 새 기기는 바로 방식 선택으로 간다.
 * 카드에 두 ID를 보여준다. 서버가 등록된 ID가 입력한 ID와 같다고 하면(계정의 다른 기기가
 * 교체 대상) 행이 하나만 나오고 설명문이 그 사실을 알려준다.
 */
export function DeviceNotice({ registeredUserId, enteredUserId, otherAccount = false, onContinue, onCancel }: DeviceNoticeProps) {
  const { t } = useTranslation();
  const sameAccount = !otherAccount && Boolean(registeredUserId && enteredUserId && maskUserId(enteredUserId) === registeredUserId);
  const body = otherAccount
    ? t('auth.verify.deviceOtherAccountBody')
    : sameAccount
      ? t('auth.verify.deviceChangedSameBody')
      : t('auth.verify.deviceChangedBody');
  const rows = otherAccount
    ? enteredUserId
      ? [{ label: t('auth.verify.deviceNewLabel'), value: enteredUserId }]
      : []
    : sameAccount
    ? [{ label: t('auth.verify.deviceSameLabel'), value: enteredUserId ?? '' }]
    : [
        ...(registeredUserId ? [{ label: t('auth.verify.deviceCurrentLabel'), value: registeredUserId }] : []),
        ...(enteredUserId ? [{ label: t('auth.verify.deviceNewLabel'), value: enteredUserId }] : []),
      ];

  return (
    <SheetFormScreen grabber
      footer={
        <>
          <NativeButton testID="device-continue" label={t('auth.verify.deviceChange')} onPress={onContinue} />
          <NativeButton testID="verify-cancel" variant="tonal" label={t('auth.verify.close')} onPress={onCancel} />
        </>
      }>
      <StepHeader
        icon={icons.deviceTransfer}
        title={t('auth.verify.deviceChangedTitle')}
        body={body}
      />
      {rows.length > 0 ? <InfoRows rows={rows} /> : null}
    </SheetFormScreen>
  );
}
