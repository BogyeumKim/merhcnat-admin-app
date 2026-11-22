import { useNativeColors } from '@/shared/theme';

import { IconButton } from './icon-button';
import { icons } from './icons';
import type { PasswordToggleProps } from './password-toggle.types';

/** 비밀번호 표시/숨김 아이콘 (Android, 기본): Material Symbols(`icons` 맵), 44dp 터치 영역은 `IconButton`이 만든다. */
export function PasswordToggle({ revealed, label, onPress }: PasswordToggleProps) {
  const colors = useNativeColors();

  return (
    <IconButton
      icon={revealed ? icons.passwordHide : icons.passwordShow}
      label={label}
      onPress={onPress}
      testID="password-toggle"
      color={colors.secondaryText}
    />
  );
}
