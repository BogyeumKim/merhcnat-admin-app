import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * 소프트 키보드가 화면에 보이는지 여부. 로그인 히어로가 입력 중 입력란 자리를 만들기 위해 사용한다.
 * iOS는 `Will` 이벤트로 키보드 애니메이션과 같이 바꾸고, Android는 `Did`만 있다.
 * 초기값은 `Keyboard.isVisible()`: 키보드가 열린 채로 마운트되는 경우(시트를 닫고 돌아옴 등)에도 맞는 값으로 시작한다.
 */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(() => Keyboard.isVisible());

  useEffect(() => {
    const show = Keyboard.addListener(process.env.EXPO_OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener(process.env.EXPO_OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
