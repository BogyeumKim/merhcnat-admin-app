# Android 플로팅 탭바 검토 (SDK 58)

대상: 제공받은 `android-floating-tab-bar.tsx` → `src/core/navigation/app-tabs/ui/android-floating-tab-bar.tsx`

## 결론

원본은 **SDK 58에서 그대로는 동작하지 않는다.** 아래 수정 후 타입체크 통과. 다만 에뮬레이터/기기 실행은 아직 하지 않았다.

## 근거와 확인 방법

| 항목 | 확인 방법 | 결과 |
| --- | --- | --- |
| `BottomTabBarProps`에 `navigation` 없음 | 설치된 `expo-router@58` 타입 정의 + tsc | **깨짐**: SDK 58은 `{ state, descriptors, emitter, navigateToTab, insets }`. 원본의 `navigation.emit/navigate`는 오류 |
| `useColorScheme()`의 `null` | tsc | 타입 오류 → `'light' \| 'dark'`로 정규화 |
| `NavigationBarItem`을 `Row` 안에 사용 | `@expo/ui` 설치본의 Kotlin 소스 | **유효**: `Row`가 `rowScope`를 자식에 전달하고 `NavigationBarItem`은 `rowScope`를 읽는다 (없으면 아무것도 렌더하지 않음). 타입 문서의 "NavigationBar 안에서만"은 이 구현과 다르게 읽히지만 소스상 `Row`로 충분 |
| `NavigationBar`의 인셋/높이 하드코딩 주장 | 같은 Kotlin 소스 | `NavigationBarProps`에 `windowInsets`가 없어 오버라이드 불가 — 원본 주석과 일치 |
| `Tabs` import 경로 | `expo-router` 타입의 `@deprecated` 표기 | `expo-router/js-tabs` 사용이 맞음 |
| 공식 문서 | v58 NavigationBar 문서 | 플로팅/둥근 컨테이너, 인셋, 높이에 대한 설명 없음 → 위 구현 방식은 문서화된 패턴이 아님 |

## 적용한 변경

1. `navigation` → `emitter.emit('tabPress')` + `navigateToTab(route.key)`.
2. `useColorScheme()` null 정규화.
3. `Shape.RoundedCorner(...)`와 색 설정을 모듈 상수로 hoist (렌더마다 새 객체 생성 방지).
4. 치수 상수를 `src/shared/lib/tab-bar/`로 분리 (`useTabBarInset`이 공유, feature가 `core`를 import하지 않고 쓸 수 있도록 `shared`에 둠).
5. 탭 목록을 `config/tabs.ts` 단일 출처로 통일, 아이콘 맵을 `TabName`으로 타입 제한.
6. 콘텐츠 가림 방지용 `useTabBarInset()` 추가.

## 성능에 대해

- SDK 58 변경 로그에 이 컴포넌트를 바꾸는 항목은 없다. Compose UI/Foundation이 1.12.1, Material 3가 1.5.0-beta01로 올라간 점은 시각 확인이 필요하다.
- "최적화되었다"를 수치로 증명하지는 못했다 (프로파일링 안 함). 구조적으로 한 일: 정적 값 hoist, `Host` 1개, 탭 전환 시 Compose 트리 1개만 갱신.
- 남은 위험: `Host`가 컨테이너 전체를 덮어, 바 주변 투명 영역(좌우 12dp, 상단 10dp)의 터치가 뒤 콘텐츠로 가지 않을 수 있다. 기기에서 확인 필요.

## 실행 전 확인 목록

- [ ] Android 에뮬레이터에서 탭 전환, 리플, 인디케이터, 다크 모드
- [ ] 그림자(`dropShadow`)와 테두리가 모서리 반경과 일치하는지
- [ ] 제스처 내비게이션/3버튼 내비게이션에서 하단 인셋
- [ ] 스크롤 화면에서 `useTabBarInset()` 적용 여부
- [ ] iOS: iOS 26+ SDK(Xcode 26+)로 빌드해야 Liquid Glass 적용

## JS tabs vs 네이티브 탭 검토 (2026-10, 설치본 소스 기준, 기기 실행/프로파일링 없음)

질문: "Android도 `@expo/ui`(Jetpack Compose)로 플로팅 하단 내비게이션을 만들 수 있나? JS 탭은 느리지 않나?"

- **바 자체는 이미 Compose다.** `expo-router/js-tabs`는 화면 컨테이너/상태만 맡고, 그려지는 바는 `@expo/ui/jetpack-compose`(`Surface` + `Row` + `NavigationBarItem`)다. 프레임마다 JS가 하는 일은 없다. "JS 탭이라 느리다"는 이 구조에서 근거를 찾지 못했다 (측정은 안 했다).
- **`NativeTabs`(Android)**: react-native-screens `Tabs.Host` 기반 Material 하단 바. 플로팅/둥근 컨테이너 옵션이 없다 (`expo-router` 타입에서 `floating` 관련 prop 없음). 탭 전환 상태는 이쪽도 Router(JS) 상태가 결정한다. 즉 네이티브 탭으로 바꿔도 플로팅은 얻을 수 없다.
- **`NativeTabs hidden` + Compose 바를 위에 얹는 방식**: `hidden`으로 바를 숨기고 `usePathname`/`router.navigate`로 직접 구동하는 것은 가능해 보이나, `tabPress`/`useScrollToTop` 연동을 직접 구현해야 하고 문서화된 패턴이 아니다. 기기에서 얻을 이득이 측정되기 전에는 채택하지 않는다.
- **`HorizontalFloatingToolbar`(M3 Expressive)**: 동작(action) 모음용 컴포넌트다. 내비게이션 바 의미(선택 상태, 라벨)가 없어 탭 바 대체로 쓰지 않는다.
- **결론**: 현재 구조(js-tabs 컨테이너 + Compose 플로팅 바)를 유지한다. 성능이 문제로 보이면 먼저 release 빌드에서 프로파일링한 뒤 `NativeTabs hidden` 방식을 실험한다. 탭 동기화 부담은 `TabName` 기반 `Record<TabName, icon>`이 컴파일 타임에 강제한다 (탭 추가 시 아이콘 누락이 타입 오류).
