import type { NoticePopup } from './schemas';

/** Room for a title and a few lines of body next to a picture, and for a text-only notice (longer text scrolls inside it). */
const TEXT_WITH_IMAGE = 150;
const TEXT_ONLY = 200;

export const hasText = (notice: NoticePopup) => notice.body.length > 0;

/** Height of the picture at the sheet width, never taller than `maxImageHeight` (a tall poster is cropped, not allowed to push the buttons away). */
export function imageHeightOf(notice: NoticePopup, width: number, maxImageHeight: number): number {
  return notice.image ? Math.min(Math.round((width * notice.image.height) / notice.image.width), maxImageHeight) : 0;
}

/** Page height: picture, plus text room when the notice has text. An image-only notice is just the picture. */
export function pageHeightOf(notice: NoticePopup, width: number, maxImageHeight: number): number {
  const image = imageHeightOf(notice, width, maxImageHeight);
  if (!notice.image) return TEXT_ONLY;
  return image + (hasText(notice) ? TEXT_WITH_IMAGE : 0);
}
