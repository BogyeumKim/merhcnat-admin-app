import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/** Android 뒤로가기 버튼을 무시한다. 이동할 곳이 없는 전체 화면(점검, 필수 업데이트 등)에서 쓴다. */
export function useBlockBackButton() {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);
}
