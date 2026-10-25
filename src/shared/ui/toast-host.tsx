import { Toaster } from 'sonner-native';

/**
 * Mount once at the app root (inside `GestureHandlerRootView`). Top position keeps toasts clear of the keyboard and
 * the tab bar; at most three are visible, and toasts grow with the system font size.
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
