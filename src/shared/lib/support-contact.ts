import { Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';
import { translate } from '@/shared/i18n';
import { showErrorToast } from '@/shared/ui/toast';

import { navigateOnce } from './navigation-lock';

/** 앱 전환(openURL) 중 들어온 두 번째 탭을 무시한다. 다른 앱으로 넘어가는 데 600ms 잠금보다 오래 걸릴 수 있다. */
let opening = false;

/**
 * 외부 앱/브라우저로 연다. `canOpenURL`은 쓰지 않는다: Android 11+는 http/tel도 매니페스트 `<queries>` 선언이 없으면
 * false를 돌려준다(선언하려면 prebuild 재빌드 필요). 대신 `openURL`의 실패(처리할 앱 없음)를 잡아 토스트로 알린다.
 */
async function openExternal(url: string, failure: { id: string; title: () => string }) {
  if (opening) return;
  let request: Promise<unknown> | null = null;
  if (!navigateOnce(() => (request = Linking.openURL(url)))) return;
  opening = true;
  try {
    await request;
  } catch {
    showErrorToast({ id: failure.id, title: failure.title() });
  } finally {
    opening = false;
  }
}

/** 카카오톡 채널 채팅을 연다: 카카오톡이 있으면 앱(유니버설/앱 링크), 없으면 브라우저 웹 채팅. */
export async function openSupportChat(): Promise<void> {
  await openExternal(SUPPORT.kakaoChatUrl, { id: 'error:support-chat', title: () => translate('support.browserUnavailable') });
}

/** 전화 앱에 고객센터 번호를 채워 연다(바로 걸지 않는다). */
export async function openSupportPhone(): Promise<void> {
  await openExternal(`tel:${SUPPORT.phone}`, { id: 'error:support-phone', title: () => translate('support.dialerUnavailable') });
}
