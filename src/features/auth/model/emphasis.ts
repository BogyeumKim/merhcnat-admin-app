export type EmphasisPart = { text: string; strong: boolean };

/**
 * 번역 문장의 `**굵게**` 표시를 조각으로 나눈다. 홀수 번째 조각이 강조 구간이다.
 * 마크다운 렌더러를 쓰지 않는다: 굵기와 함께 색(본문 회색 → 강조 진한 색)도 바꿔야 해서 조각별로 그린다.
 */
export function splitEmphasis(text: string): EmphasisPart[] {
  return text
    .split('**')
    .map((part, index) => ({ text: part, strong: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}
