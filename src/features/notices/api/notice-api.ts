import { apiJson } from '@/shared/api/client';
import { env } from '@/shared/config/env';

import { noticePopupsDataSchema, type NoticePopup } from '../model/schemas';

/**
 * 계약(제안 단계, 아직 미구현): docs/backend-contract/notice-popup.md. `GET /api/notices/popup` (Bearer)는
 * 200 `{ notices: [{ id, title, body, image? }] }`를 반환한다. 서버가 이 계정에 로그인 시
 * 보여주길 원하는 공지이며 우선순위가 높은 순이다. 누구에게 무엇을 얼마나 보여줄지는 서버가 정한다.
 */
export async function fetchPopupNotices(): Promise<NoticePopup[]> {
  // `__DEV__`는 빌드 시점 상수다. 릴리스 번들에서는 이 분기(와 fixture 모듈)가 제거된다.
  if (__DEV__ && env.noticeMock) {
    return (await import('./notice-api.mock')).mockPopupNotices;
  }
  return (await apiJson('/api/notices/popup', noticePopupsDataSchema)).notices;
}
