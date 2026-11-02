import { apiEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

import { noticePopupsDataSchema, type NoticePopup } from '../model/schemas';

/**
 * Contract (proposed, not built yet): docs/backend-contract/notice-popup.md. `GET /api/notices/popup` (Bearer) returns
 * `{ code: "SUCCESS", data: { notices: [{ id, title, body, image? }] } }`: the notices the server wants shown at
 * sign-in for this account, newest priority first. The server decides who sees what and for how long.
 */
export async function fetchPopupNotices(): Promise<NoticePopup[]> {
  // `__DEV__` is a build-time constant: in release bundles this branch (and the fixture module) is removed.
  if (__DEV__ && env.noticeMock) {
    return (await import('./notice-api.mock')).mockPopupNotices;
  }
  const { status, code, data } = await apiEnvelope('/api/notices/popup', noticePopupsDataSchema);
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
  return data.notices;
}
