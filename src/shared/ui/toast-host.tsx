import { Toaster } from 'sonner-native';

/**
 * 앱 루트에 한 번만 마운트한다 (`GestureHandlerRootView` 안). 상단 위치라 토스트가 키보드와 탭바를 가리지 않으며,
 *  동시에 최대 3개까지 보이고 시스템 글자 크기에 맞춰 커진다.
 */
export function ToastHost() {
  return (
    <Toaster
      theme="system"
      richColors
      closeButton
      position="top-center"
      visibleToasts={3}
      autoWiggleOnUpdate="always"
    />
  );
}
