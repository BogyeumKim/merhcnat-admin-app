import { AlertDialog, Text, TextButton } from '@expo/ui/jetpack-compose';

import { useTranslation } from '@/shared/i18n';
import { useAlertModal, useCloseAlertModal } from '@/shared/model/alert-modal-store';
import { useNativeColors } from '@/shared/theme';
import { NativeHost } from '@/shared/ui/native-host';

/**
 * 전역 알림 다이얼로그(Android): Jetpack Compose M3 `AlertDialog`. 앱의 다른 Compose UI와 같은 Material 3 모양이다
 * (RN `Alert`는 플랫폼 `android.app.AlertDialog`라 M3 테마를 따르지 않는다). 다이얼로그는 별도 창이라 `Host` 크기와 무관하다.
 * 바깥 탭·뒤로가기(`onDismissRequest`)는 취소와 같다. 되돌릴 수 없는 동작은 확인 버튼을 `danger` 색으로 그린다.
 */
export function AlertModalHost() {
  const { t } = useTranslation();
  const alert = useAlertModal();
  const close = useCloseAlertModal();
  const { danger } = useNativeColors();

  if (!alert.isOpen) return null;

  const cancel = () => {
    close();
    alert.onCancel?.();
  };
  const confirm = () => {
    close();
    alert.onConfirm();
  };

  return (
    <NativeHost>
      <AlertDialog onDismissRequest={cancel}>
        <AlertDialog.Title>
          <Text>{alert.title}</Text>
        </AlertDialog.Title>
        {alert.description ? (
          <AlertDialog.Text>
            <Text>{alert.description}</Text>
          </AlertDialog.Text>
        ) : null}
        <AlertDialog.DismissButton>
          <TextButton onClick={cancel}>
            <Text>{alert.cancelLabel ?? t('common.cancel')}</Text>
          </TextButton>
        </AlertDialog.DismissButton>
        <AlertDialog.ConfirmButton>
          <TextButton onClick={confirm} colors={alert.destructive ? { contentColor: danger } : undefined}>
            <Text>{alert.confirmLabel}</Text>
          </TextButton>
        </AlertDialog.ConfirmButton>
      </AlertDialog>
    </NativeHost>
  );
}
