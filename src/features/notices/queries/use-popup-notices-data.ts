import { useQuery } from '@tanstack/react-query';

import { noticeQueryKeys } from './query-keys';
import { fetchPopupNotices } from '../api/notice-api';

/** 로그인 공지는 로그인마다 한 번 보는 값이라 자주 다시 가져올 필요가 없다(로그아웃 시 캐시는 비워진다). */
const POPUP_NOTICES_STALE_MS = 5 * 60 * 1000;

/** 로그인 시 보여줄 공지. 불러오기 실패는 오류 화면을 띄울 만큼 중요하지 않다. 팝업만 뜨지 않는다. */
export function usePopupNoticesData() {
  return useQuery({ queryKey: noticeQueryKeys.popup(), queryFn: fetchPopupNotices, staleTime: POPUP_NOTICES_STALE_MS });
}
