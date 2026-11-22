/** 홈 feature의 쿼리 키. 컴포넌트에 문자열 배열을 직접 쓰지 않는다(`.claude/rules/data-fetching.md`). */
export const homeQueryKeys = {
  all: ['home'] as const,
  summary: () => [...homeQueryKeys.all, 'summary'] as const,
};
