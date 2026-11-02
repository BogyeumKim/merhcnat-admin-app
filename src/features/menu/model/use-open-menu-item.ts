import { router } from 'expo-router';

import type { MenuItemId } from './catalog';

/** Settings has its own screen; every other entry opens the placeholder route until its screen exists (the id picks the title). */
export function openMenuItem(id: MenuItemId) {
  if (id === 'settings') {
    router.push('/settings');
    return;
  }
  router.push({ pathname: '/feature/[id]', params: { id } });
}
