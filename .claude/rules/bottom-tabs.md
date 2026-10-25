---
paths:
  - "src/core/navigation/app-tabs/**"
  - "src/app/_layout.tsx"
  - "src/app/**/_layout.tsx"
---

# 하단 탭 규칙 (iOS 네이티브 Liquid Glass / Android Compose 플로팅 바)

검토 기록: `docs/reviews/android-floating-tab-bar.md`

- 탭 목록의 단일 출처는 `src/core/navigation/app-tabs/config/tabs.ts`. 탭을 추가하면 ① `TAB_ITEMS`, ② `src/app/<name>.tsx` route, ③ Android 아이콘 `assets/icons/<name>.xml` + `TabIcons`를 함께 추가한다.
- 사용자 타입별로 탭이 달라지면 `.claude/rules/user-types.md`의 capability로 `Tabs.Protected`/`NativeTabs.Trigger hidden`을 제어한다. 탭 구성은 로그인 세션 동안 바뀌지 않아야 한다 (런타임 추가/삭제는 네비게이터를 다시 마운트한다).
- **iOS**: `NativeTabs` (`expo-router/native-tabs`, `unstable-` 경로 아님). `backgroundColor`/`indicatorColor` 등을 지정하면 Liquid Glass 효과가 사라지므로 지정하지 않는다. Liquid Glass는 **iOS 26+ SDK(Xcode 26+)로 빌드해야** 적용된다.
- **Android**: `Tabs`는 `expo-router/js-tabs`에서 import (`expo-router`의 `Tabs`는 deprecated). `tabBar`에 Compose 바를 넘긴다.
- SDK 58의 `BottomTabBarProps`는 `{ state, descriptors, emitter, navigateToTab, insets }`. **`navigation` prop은 없다.** `tabPress`는 `emitter.emit`, 이동은 `navigateToTab(route.key)`.
- SDK 58은 layout에 **선언된 화면만** 렌더링한다. 새 탭은 `Tabs.Screen`/`NativeTabs.Trigger`에 선언한다. 숨길 라우트는 `options={{ href: null }}`.
- `@expo/ui/jetpack-compose`는 Android 전용. `android-floating-tab-bar.tsx`는 `app-tabs.android.tsx`에서만 import한다.
- 플로팅 바는 absolute라 콘텐츠를 가린다. Android 화면은 `@/shared/lib/tab-bar`의 `useTabBarInset()` 값을 하단 패딩으로 쓴다 (iOS는 0). feature가 `core`를 import할 수 없으므로 이 훅과 치수 상수는 `shared`에 있다.
- M3 `NavigationBar` 컨테이너는 쓰지 않는다 (하단 시스템 인셋 패딩 + 최소 높이가 하드코딩되어 플로팅 바에 맞지 않음). `Row` + `NavigationBarItem` 조합을 유지한다.
- 모서리 반경은 `src/shared/lib/tab-bar/floating-tab-bar.ts`의 `CORNER_RADIUS` 한 곳에서만 바꾼다 (Surface shape과 shadow shape가 함께 따라간다).
