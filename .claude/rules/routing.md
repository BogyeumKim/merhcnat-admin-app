---
paths:
  - "src/app/**"
---

# Expo Router 규칙 (SDK 58)

- `src/app/`의 모든 파일은 화면이다. 컴포넌트·훅·유틸은 `src/app/` 밖에 둔다.
- `Link`, `router`, `useLocalSearchParams`는 `expo-router`에서 import. typed routes가 켜져 있으므로 `href` 타입을 만족시킨다.
- 탭은 `NativeTabs`, 헤더/툴바는 `Stack`(`Stack.Toolbar`는 `@expo/ui` peer 필요), 모달/시트는 router의 form sheet 또는 `@expo/ui` `BottomSheet`.
- `expo-router/react-navigation` 및 포크된 React Navigation API에 의존하는 커스텀 navigator를 새로 만들지 않는다. 필요하면 `extendRouter` / `integrateWithRouter`.
- safe area는 `react-native-safe-area-context`.
- 비활성 화면 상태를 보존하려면 `activityEnabled` / `NavigationAwareActivity`를 사용한다.
- 화면 단위 에러 처리는 `unstable_screenErrorBoundary`.

## 인증 라우트 보호

- 로그인/비로그인 화면 분기는 `Stack.Protected guard`로 한다 (`src/app/_layout.tsx`). 훅에서 `router.replace`로 리다이렉트하는 방식은 쓰지 않는다 (깜빡임/경쟁 상태).
- 세션 상태는 `features/auth`의 `SessionProvider` / `useSession()`. 토큰은 `expo-secure-store`에 저장된다.
- 보호할 화면은 `(tabs)` 같은 그룹 단위로 `Stack.Protected guard={!!session}` 안에 선언한다. 비로그인 화면(`sign-in`)은 `guard={!session}`.
- `isLoading` 동안은 네비게이터를 렌더하지 않는다.
- 로그인 화면의 개발용 버튼은 `__DEV__`에서만 보이는 임시 코드다. 백엔드 로그인 연동 시 제거하고 `signIn(token)`을 호출한다.

## import 경로 (expo-router skill 기준, SDK 58 설치본으로 확인)

- `Stack`은 `expo-router/stack`, `ThemeProvider`/`DarkTheme`/`DefaultTheme`는 `expo-router/react-navigation`에서 import한다. `@react-navigation/*`를 직접 import하지 않는다.
- 플랫폼 분기는 `Platform.OS`가 아니라 `process.env.EXPO_OS`.
- Context는 `useContext`가 아니라 `React.use`.
