import { Button } from '@expo/ui';

import type { NativeButtonProps } from './native-button.types';

const FULL_WIDTH = { width: '100%' } as const;
const noop = () => {};

/** 전체 너비 버튼, 플랫폼 공용 대체 구현 (iOS/Android는 각자 파일이 쓰인다). `leading`·스피너는 그리지 않는다. */
export function NativeButton({ label, onPress, variant = 'filled', disabled, loading = false, testID }: NativeButtonProps) {
  return (
    <Button
      label={label}
      variant={variant === 'tonal' || variant === 'ink' ? 'filled' : variant}
      disabled={disabled}
      onPress={loading ? noop : onPress}
      testID={testID}
      style={FULL_WIDTH}
    />
  );
}
