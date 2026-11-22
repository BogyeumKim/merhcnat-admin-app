import type { SFSymbol } from 'expo-symbols';

/**
 * 하단 탭의 단일 기준. `name`은 `src/app/(tabs)/`의 라우트 파일명과 같아야 한다.
 *  `labelKey`는 i18n 키. iOS는 `sf`(SF Symbols), Android는 `md`(Material Symbols 이름)를 쓴다.
 *  `NativeTabs`는 `Icon`과 달리 에셋이 아닌 이름 문자열을 받으므로 탭 아이콘은 `shared/ui/icons.ts`가 아니라 여기서만 정의한다.
 */
export const TAB_ITEMS = [
  { name: 'index', labelKey: 'tabs.home', sf: { default: 'house', selected: 'house.fill' }, md: 'home' },
  { name: 'transactions', labelKey: 'tabs.transactions', sf: { default: 'doc.text', selected: 'doc.text.fill' }, md: 'receipt_long' },
  { name: 'stores', labelKey: 'tabs.stores', sf: { default: 'storefront', selected: 'storefront.fill' }, md: 'storefront' },
  { name: 'menu', labelKey: 'tabs.menu', sf: { default: 'line.3.horizontal', selected: 'line.3.horizontal' }, md: 'menu' },
] as const satisfies readonly {
  name: string;
  labelKey: `tabs.${string}`;
  sf: { default: SFSymbol; selected: SFSymbol };
  md: string;
}[];

export type TabName = (typeof TAB_ITEMS)[number]['name'];
