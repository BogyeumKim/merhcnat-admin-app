import { useSyncExternalStore } from 'react';
import { Keyboard } from 'react-native';

/** `Keyboard.isVisible` reads `this`, so it must be called on `Keyboard`, never passed around unbound. */
function getSnapshot() {
  return Keyboard.isVisible();
}

function subscribe(onChange: () => void) {
  const show = Keyboard.addListener('keyboardDidShow', onChange);
  const hide = Keyboard.addListener('keyboardDidHide', onChange);
  return () => {
    show.remove();
    hide.remove();
  };
}

/**
 * Whether the soft keyboard is open. Only for layout decisions the native layer cannot make itself
 * (keyboard avoidance stays native: SwiftUI safe area on iOS, Compose `imePadding()` on Android).
 * On Android these events come from the root view's IME inset check, so they also fire edge-to-edge.
 */
export function useKeyboardVisible() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
