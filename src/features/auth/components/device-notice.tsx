import { useTranslation } from '@/shared/i18n';
import { icons } from '@/shared/ui/icons';
import { InfoRows } from '@/shared/ui/info-rows';
import { NativeButton } from '@/shared/ui/native-button';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';
import { StatusHeader } from '@/shared/ui/status-header';

import { EmphasisText } from './emphasis-text';

type DeviceNoticeProps = {
  /**
   * 이 기기에 지금 등록된 아이디(서버가 마스킹). 다른 계정 기기면 그 계정의, 본인 다른 기기면 본인의 마스킹 아이디다.
   * 서버가 보내지 않으면(새 기기 등) "현재 등록된 아이디" 행을 숨긴다.
   */
  registeredUserId?: string;
  /** 로그인 화면에서 방금 입력한 ID. 사용자가 직접 입력한 값이라 가리지 않고 그대로 보인다. */
  enteredUserId?: string;
  onContinue: () => void;
  onCancel: () => void;
};

/**
 * "기기 등록을 변경할까요?" (디자인 1-4): 아이콘 배지, 제목, 아이디 카드(현재 등록된 아이디 · 변경할 아이디), 굵은 구간이 있는 설명,
 * [변경하기] / [닫기]. 시트 공통 규칙대로 그래버와 스와이프로도 닫히고, 닫으면 로그인 입력값은 남는다.
 */
export function DeviceNotice({ registeredUserId, enteredUserId, onContinue, onCancel }: DeviceNoticeProps) {
  const { t } = useTranslation();
  const rows = [
    ...(registeredUserId ? [{ label: t('auth.verify.deviceCurrentLabel'), value: registeredUserId }] : []),
    ...(enteredUserId ? [{ label: t('auth.verify.deviceNewLabel'), value: enteredUserId }] : []),
  ];

  return (
    <SheetFormScreen
      grabber
      footer={
        <>
          <NativeButton testID="device-continue" label={t('auth.verify.deviceChange')} onPress={onContinue} />
          <NativeButton testID="verify-cancel" variant="tonal" label={t('auth.verify.close')} onPress={onCancel} />
        </>
      }>
      <StatusHeader icon={icons.deviceTransfer} tone="warning" title={t('auth.verify.deviceChangedTitle')} />
      {rows.length > 0 ? <InfoRows rows={rows} /> : null}
      <EmphasisText>{t('auth.verify.deviceChangedBody')}</EmphasisText>
    </SheetFormScreen>
  );
}
