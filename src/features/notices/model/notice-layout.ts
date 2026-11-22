import type { NoticePopup } from './schemas';

/** 이미지 옆의 제목과 본문 몇 줄, 그리고 텍스트만 있는 공지를 위한 공간(더 긴 텍스트는 안에서 스크롤). */
const TEXT_WITH_IMAGE = 150;
const TEXT_ONLY = 200;

export const hasText = (notice: NoticePopup) => notice.body.length > 0;

/** 시트 너비에서의 이미지 높이. `maxImageHeight`를 넘지 않는다(세로로 긴 포스터는 잘라내며 버튼을 밀어내지 못하게 한다). */
export function imageHeightOf(notice: NoticePopup, width: number, maxImageHeight: number): number {
  return notice.image ? Math.min(Math.round((width * notice.image.height) / notice.image.width), maxImageHeight) : 0;
}

/** 페이지 높이: 이미지에 더해, 공지에 텍스트가 있으면 텍스트 공간. 이미지만 있는 공지는 이미지 높이뿐이다. */
export function pageHeightOf(notice: NoticePopup, width: number, maxImageHeight: number): number {
  const image = imageHeightOf(notice, width, maxImageHeight);
  if (!notice.image) return TEXT_ONLY;
  return image + (hasText(notice) ? TEXT_WITH_IMAGE : 0);
}
