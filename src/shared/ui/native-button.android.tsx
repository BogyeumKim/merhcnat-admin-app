import { Button, FilledTonalButton, OutlinedButton, Text, TextButton } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height, testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';

import { useNativeColors } from '@/shared/theme';

import type { NativeButtonProps } from './native-button.types';

/** 56dp: Korpay 디자인 pill 버튼 높이 (Material 최소 터치 영역 48dp보다 큼). */
const FULL_WIDTH = [fillMaxWidth(), height(56)];

/**
 * Material 3 버튼 (Android). 브랜드 `action` 색을 명시적으로 지정한다. 범용 `Button`은 Host가 생성한 Material 색상표에서
 *  색을 가져오는데, 빨간 시드는 브랜드 레드가 아닌 칙칙한 갈색 primary가 되기 때문이다.
 *  비활성 색은 Material 기본값을 그대로 쓴다 (회색 컨테이너, 38% 콘텐츠).
 */
export function NativeButton({ label, onPress, variant = 'filled', disabled, testID }: NativeButtonProps) {
  const colors = useNativeColors();
  const modifiers = testID ? [...FULL_WIDTH, testIDModifier(testID)] : FULL_WIDTH;
  const common = { onClick: disabled ? undefined : onPress, enabled: !disabled, modifiers };
  const content = <Text>{label}</Text>;

  if (variant === 'tonal') {
    return (
      <FilledTonalButton {...common} colors={{ containerColor: colors.tonal, contentColor: colors.text }}>
        {content}
      </FilledTonalButton>
    );
  }
  if (variant === 'ink') {
    return (
      <Button {...common} colors={{ containerColor: colors.ink, contentColor: colors.background }}>
        {content}
      </Button>
    );
  }
  if (variant === 'outlined') {
    return (
      <OutlinedButton {...common} colors={{ contentColor: colors.action }}>
        {content}
      </OutlinedButton>
    );
  }
  if (variant === 'text') {
    return (
      <TextButton {...common} colors={{ contentColor: colors.action }}>
        {content}
      </TextButton>
    );
  }
  return (
    <Button {...common} colors={{ containerColor: colors.action, contentColor: colors.onAction }}>
      {content}
    </Button>
  );
}
