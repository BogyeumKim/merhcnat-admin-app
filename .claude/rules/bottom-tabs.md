---
paths:
  - "src/core/navigation/app-tabs/**"
  - "src/app/_layout.tsx"
  - "src/app/**/_layout.tsx"
---

# 하단 탭 규칙 (iOS/Android 공통 `NativeTabs`)

검토 기록: `docs/reviews/android-tab-bar.md`

- 탭 목록의 단일 출처는 `src/core/navigation/app-tabs/config/tabs.ts`. 탭을 추가하면 ① `TAB_ITEMS`, ② `src/app/(tabs)/<name>.tsx` route, ③ `TAB_ITEMS`의 `sf`(iOS SF Symbols)와 `md`(Android Material Symbols 이름) 아이콘을 함께 지정한다.
- 사용자 타입별로 탭이 달라지면 `.claude/rules/user-types.md`의 capability로 `NativeTabs.Trigger hidden`을 제어한다. 탭 구성은 로그인 세션 동안 바뀌지 않아야 한다 (런타임 추가/삭제는 네비게이터를 다시 마운트한다).
- **iOS**: `NativeTabs` (`expo-router/native-tabs`, `unstable-` 경로 아님). `backgroundColor`/`indicatorColor` 등을 지정하면 Liquid Glass 효과가 사라지므로 지정하지 않는다. Liquid Glass는 **iOS 26+ SDK(Xcode 26+)로 빌드해야** 적용된다.
- **Android**: 같은 `NativeTabs`(Material 3 네비게이션 바). 아이콘은 `NativeTabs.Trigger.Icon`의 `md`. 기본 색은 시드에서 생성돼 연보라 톤이라 앱 디자인과 어울리지 않는다. 그래서 **Android에서만**(`process.env.EXPO_OS === 'android'`) 배경 `card`(흰색), 선택 `ink`(진한 회색, Korpay 디자인), 비선택 `secondaryText`, 인디케이터 투명을 준다(`app-tabs.tsx`, 토스/신한/트래블월렛 탭 바처럼). 별도 Compose 탭 바/`js-tabs`를 쓰지 않는다.
- 탭 바는 레이아웃 흐름 안에 있어 화면이 하단 패딩을 따로 줄 필요가 없다 (`TabScreen` 사용).
