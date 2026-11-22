import { Button } from '@expo/ui';

import type { NativeButtonProps } from './native-button.types';

const FULL_WIDTH = { width: '100%' } as const;

/** 전체 너비 버튼, 플랫폼 공용 대체 구현 (iOS/Android는 각자 파일이 쓰인다). */
export function NativeButton({ label, onPress, variant = 'filled', disabled, testID }: NativeButtonProps) {
  return (
    <Button
      label={label}
      variant={variant === 'tonal' || variant === 'ink' ? 'filled' : variant}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={FULL_WIDTH}
    />
  );
}
