import { Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

import { useNativeColors } from '@/shared/theme';

import type { EmphasisTextProps } from './emphasis-text.types';
import { splitEmphasis } from '../model/emphasis';

// `NativeText` body와 같은 Dynamic Type 스타일. 강조 구간만 semibold.
const bodyFont = font({ textStyle: 'body' });
const strongFont = font({ textStyle: 'body', weight: 'semibold' });

/** 본문(보조 색) 안에 강조 구간(본문 색 + 굵게)을 이어 그린다. SwiftUI `Text` 연결(nested `Text`)이라 한 문단으로 줄바꿈된다. */
export function EmphasisText({ children }: EmphasisTextProps) {
  const colors = useNativeColors();

  return (
    <Text modifiers={[bodyFont, foregroundStyle(colors.secondaryText)]}>
      {splitEmphasis(children).map((part, index) =>
        part.strong ? (
          <Text key={index} modifiers={[strongFont, foregroundStyle(colors.text)]}>
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}
