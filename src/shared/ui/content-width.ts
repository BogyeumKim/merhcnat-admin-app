import type { ContentWidthModifiers } from './content-width.types';

/**
 * 콘텐츠 컬럼을 `CONTENT_MAX_WIDTH` 이하로 묶는 네이티브 모디파이어. 범용 `style`에는 maxWidth가 없어 플랫폼 파일이 구현한다.
 * 이 기본 파일은 플랫폼 중립 폴백이다(iOS/Android는 각자 파일이 쓰인다).
 */
export function useContentWidthModifiers(): ContentWidthModifiers {
  return undefined;
}
