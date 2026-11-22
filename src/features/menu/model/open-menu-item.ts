import { router } from 'expo-router';

import { navigateOnce } from '@/shared/lib/navigation-lock';

import type { MenuItemId } from '../model/catalog';

/**
 * 설정은 자체 화면이 있고, 나머지 항목은 화면이 생기기 전까지 임시 라우트를 연다(id로 제목을 정함).
 * 전체메뉴 행·홈 카드·헤더 아이콘이 모두 여기로 온다: 연타로 같은 화면이 두 번 쌓이지 않게 이동 잠금을 거친다.
 */
export function openMenuItem(id: MenuItemId) {
  navigateOnce(() => {
    if (id === 'settings') router.push('/settings');
    else router.push({ pathname: '/feature/[id]', params: { id } });
  });
}
