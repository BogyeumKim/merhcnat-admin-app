import { signOutLocally, useCapabilities } from '@/features/auth';
import { navigateOnce } from '@/shared/lib/navigation-lock';

import { visibleCatalog } from '../model/catalog';
import { openMenuItem } from '../model/open-menu-item';

/**
 * 전체메뉴 화면의 동작: 계정 타입별로 보이는 카테고리, 항목·알림 열기, 로그아웃.
 * 화면(`menu-screen.tsx`)은 렌더링만 한다.
 */
export function useMenuScreen() {
  const categories = visibleCatalog(useCapabilities());

  return {
    categories,
    openItem: openMenuItem,
    openNotices: () => openMenuItem('notices'),
    // 로그아웃도 사용자 탭으로 시작하는 이동이다: 연타 잠금을 거친다.
    signOut: () => navigateOnce(() => signOutLocally()),
  };
}
