import { NativeText } from '@/shared/ui/native-text';

import type { EmphasisTextProps } from './emphasis-text.types';
import { splitEmphasis } from '../model/emphasis';

/** 플랫폼 파일이 없을 때의 폴백: 강조 없이 본문으로 그린다(표시는 지운다). */
export function EmphasisText({ children }: EmphasisTextProps) {
  return <NativeText tone="secondary">{splitEmphasis(children).map((part) => part.text).join('')}</NativeText>;
}
