/** 공지 feature의 쿼리 키. */
export const noticeQueryKeys = {
  all: ['notices'] as const,
  popup: () => [...noticeQueryKeys.all, 'popup'] as const,
};
