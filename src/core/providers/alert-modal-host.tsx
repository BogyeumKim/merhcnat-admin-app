import { useEffect } from 'react';
import { Alert } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { useAlertModal, useCloseAlertModal } from '@/shared/model/alert-modal-store';

/**
 * 전역 알림 다이얼로그(iOS). RN `Alert.alert`는 `UIAlertController`를 그대로 띄운다: SwiftUI `.alert`(`@expo/ui` `Alert`)와
 * 같은 시스템 알림이지만 트리거 뷰와 `Host`가 필요 없어 루트에 레이아웃을 더하지 않는다. Android는 `alert-modal-host.android.tsx`.
 * 루트에서 한 번만 렌더한다. 버튼을 누르면 먼저 닫고(store) 콜백을 부른다.
 */
export function AlertModalHost() {
  const { t } = useTranslation();
  const alert = useAlertModal();
  const close = useCloseAlertModal();

  useEffect(() => {
    if (!alert.isOpen) return;
    const cancel = () => {
      close();
      alert.onCancel?.();
    };
    Alert.alert(
      alert.title,
      alert.description,
      [
        { text: alert.cancelLabel ?? t('common.cancel'), style: 'cancel', onPress: cancel },
        {
          text: alert.confirmLabel,
          style: alert.destructive ? 'destructive' : 'default',
          onPress: () => {
            close();
            alert.onConfirm();
          },
        },
      ],
      { cancelable: true, onDismiss: cancel },
    );
  }, [alert, close, t]);

  return null;
}
