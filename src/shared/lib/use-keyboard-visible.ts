import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/** Whether the software keyboard is on screen. The sign-in hero uses it to make room for the fields while typing. */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

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
