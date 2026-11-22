import { Text } from '@expo/ui/jetpack-compose';

import { useNativeColors } from '@/shared/theme';

import type { EmphasisTextProps } from './emphasis-text.types';
import { splitEmphasis } from '../model/emphasis';

// `NativeText` body와 같은 크기(sp라 시스템 글자 크기를 따른다). 강조 구간만 굵게.
const BODY_STYLE = { fontSize: 16, fontWeight: '400' } as const;
const STRONG_STYLE = { fontWeight: '600' } as const;

/** 본문(보조 색) 안에 강조 구간(본문 색 + 굵게)을 이어 그린다. Compose nested `Text` 스팬이라 한 문단으로 줄바꿈된다. */
export function EmphasisText({ children }: EmphasisTextProps) {
  const colors = useNativeColors();

  return (
    <Text color={colors.secondaryText} style={BODY_STYLE}>
      {splitEmphasis(children).map((part, index) =>
        part.strong ? (
          <Text key={index} color={colors.text} style={STRONG_STYLE}>
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}
