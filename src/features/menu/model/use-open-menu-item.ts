import { router } from 'expo-router';

import type { MenuItemId } from './catalog';

/** Every entry opens the same placeholder route until its screen exists; the id picks the title. */
export function openMenuItem(id: MenuItemId) {
  router.push({ pathname: '/feature/[id]', params: { id } });
}
