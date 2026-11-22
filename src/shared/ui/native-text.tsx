import { Text } from '@expo/ui';

import { useNativeColors } from '@/shared/theme';

import { TONE_COLOR } from './native-text-tone';
import type { NativeTextProps } from './native-text.types';

/** Android(기본) 크기. Compose가 `fontSize`를 `sp`로 변환하므로 시스템 글자 크기를 따른다. */
const sizes = {
  largeTitle: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '700' },
  headline: { fontSize: 17, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
} as const;

/**
 * `@expo/ui` 트리(`Host`) 안에 그리는 텍스트. 플랫폼 파일이 일부러 다르다: iOS에서 명시적 `fontSize`는
 *  *고정* 크기(Dynamic Type 미적용)이므로 `native-text.ios.tsx`는 SwiftUI 텍스트 스타일을 쓴다.
 */
// `selectable`/`tabular`는 Android에서 아직 무시한다(`native-text.types.ts` 참고).
export function NativeText({ children, variant = 'body', tone = 'default', center }: NativeTextProps) {
  const colors = useNativeColors();
  const color = TONE_COLOR[tone](colors);

  return <Text textStyle={{ ...sizes[variant], color, textAlign: center ? 'center' : 'left' }}>{children}</Text>;
}
