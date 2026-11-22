import type { NoticePopup } from '../model/schemas';

export type NoticePagerProps = {
  notices: NoticePopup[];
  width: number;
  height: number;
  maxImageHeight: number;
  /** 현재 페이지. 이웃 페이지까지만 이미지를 그린다(`isNearPage`). */
  index: number;
  onPageChange: (index: number) => void;
};

/** 현재 페이지와 그 양옆만 이미지를 불러온다: 멀리 있는 페이지의 이미지 디코딩·메모리를 아낀다. */
export const isNearPage = (page: number, index: number) => Math.abs(page - index) <= 1;
