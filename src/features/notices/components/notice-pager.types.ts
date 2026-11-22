import type { NoticePopup } from '../model/schemas';

export type NoticePagerProps = {
  notices: NoticePopup[];
  width: number;
  height: number;
  maxImageHeight: number;
  onPageChange: (index: number) => void;
};
