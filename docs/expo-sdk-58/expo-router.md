# Expo Router (SDK 58)

마이그레이션 가이드: https://docs.expo.dev/router/migrate/sdk-57-to-58/

## 안정화 (실험 플래그 불필요)

data loaders, SSR, middleware, native tabs, toolbars, 표준 내비게이션 통합.

## 변경점

- **내비게이션 코어 재작성**: 결정적 state/route key, dispatch는 commit 이후로 지연. 포크된 React Navigation API 대부분 제거 → 커스텀 navigator와 `expo-router/react-navigation` import 점검.
- (web 전용) 서버 출력이 기본값으로 바뀌었다. 이 프로젝트는 web을 쓰지 않아 해당 없음.
- **Loader 캐싱**은 플랫폼 HTTP 캐시 사용 → `loader`에서 `Cache-Control` 설정.
- **Web async routes** 기본 활성 (`asyncRoutes: { web: false }`로 끔).
- **React transitions / activities**: 기본은 preload에만 transition. `activityEnabled` 또는 `NavigationAwareActivity`로 비활성 화면을 숨기되 상태 보존.
- **커스텀 라우터**: `extendRouter`, `extendRouterActions`.
- **화면 에러 바운더리**: `unstable_settings.screenErrorBoundary` 또는 `<Stack unstable_screenErrorBoundary />`.
- **Web safe area**는 `react-native-safe-area-context`가 아니라 CSS `env(safe-area-inset-*)`.
- optional peer: `expo-symbols`(Android `NativeTabs.Trigger.Icon`의 `md`), `@expo/ui`(`Stack.Toolbar`).
- 폐기: `withLayoutContext` → `integrateWithRouter`.

## 이 프로젝트 규칙 요약

- 탭은 `NativeTabs`, 헤더/툴바는 `Stack`/`Stack.Toolbar`.
- `Link`, `router`, `useLocalSearchParams`는 `expo-router`에서 import.
- typed routes 활성 — `href`는 타입 통과해야 함.
