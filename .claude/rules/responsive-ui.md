---
paths:
  - "src/**/*.tsx"
---

# 반응형 UI / 글꼴 / 키보드 규칙

근거와 미확인 항목: `docs/architecture/responsive-ui.md`

- 레이아웃은 **창 크기**로 정한다 (`useWindowLayout()`: 600dp/840dp, 가로, `isShort`, `fontScale`). 기기 이름/모델로 분기하지 않는다. 폴드, 태블릿, 분할 화면, iOS 27 리사이즈 창 모두 같은 코드로 동작해야 한다.
- 고정 `height`로 콘텐츠 영역을 만들지 않는다. `minHeight`, flex(`flexGrow`/`flexShrink`), `gap`을 쓰고, 세로로 길어질 수 있는 화면은 스크롤 가능해야 한다. 폼은 최대 너비(`maxWidth`)를 둔다.
- **시스템 글꼴 최대 크기에서도 글자가 잘리면 안 된다.** 문구는 줄바꿈되고 레이아웃이 아래로 늘어나야 한다. `allowFontScaling={false}`, 본문 `maxFontSizeMultiplier` 상한, 고정 `lineHeight`, 의미 있는 문구의 `numberOfLines` 사용 금지.
- **`@expo/ui` `Text`/입력창에서 iOS 글꼴 크기:** `fontSize`는 iOS에서 고정 크기라 Dynamic Type을 따르지 않는다. `@expo/ui` 안의 문구는 `NativeText`(`shared/ui`)를 쓰고, 입력창/버튼에는 `fontSize`를 주지 않는다. 일반 문구는 `AppText`(RN `Text`).
- 키보드: 폼 본문은 `BrandedFormScreen`(Host 안 네이티브 스크롤: iOS 키보드 세이프에어리어, Android `imePadding()`)을 쓴다. `react-native-keyboard-controller`의 `KeyboardAwareScrollView`는 Android Compose 입력창을 인식하지 못하므로 `@expo/ui` 입력창과 함께 쓰지 않는다. 입력창에 `autoComplete`(username/current-password/one-time-code), `keyboardType`, `returnKeyType`을 지정한다.
- `Host`의 `matchContents`는 마운트 시 한 번만 정해진다. 화면 전체를 채우는 Host는 `NativeHost fill`, 컨트롤 몇 개만 감싸면 `NativeHost`.
- 색: React Native 뷰는 `colors`(시맨틱), `@expo/ui` style props는 문자열 hex라 `useNativeColors()`. 브랜드 빨강 `brand`는 로고 전용, 버튼/링크/틴트는 `action`. `PlatformColor`를 `@expo/ui`에 넘기지 않는다. 다크/라이트 둘 다 대비를 확인한다.
- 로고/브랜드 이미지는 SVG를 `expo-image`(`BrandLogo`)로 그린다. SVG에는 호(arc) 명령을 쓰지 않고 `viewBox`를 유지한다.
- 새 화면은 작은 폰(320dp 너비), 가로, 큰 글꼴에서 깨지지 않는지 `docs/architecture/responsive-ui.md`의 체크리스트로 확인한다. 기기에서 확인하지 못했으면 확인하지 못했다고 보고한다.
- 네이티브 스크롤 안의 패딩은 스크롤 **안쪽** 콘텐츠(`FormColumn`)에 둔다. 스크롤 뷰 자체에 패딩을 주면 스크롤 영역 밖이라 콘텐츠가 잘린다.
- 입력창에는 보이는 라벨(`LabeledField`)을 둔다. 오류 문구는 `useAnnounce`로 낭독한다. iOS 숫자 패드 입력은 마지막 자리에서 자동 제출한다 (Return 키 없음).
- 버튼은 `NativeButton`을 쓴다 (iOS 44pt 터치 영역). 브랜드 색을 바꿀 때는 라이트/다크 모두 흰 글자 버튼과 텍스트 버튼 대비 4.5:1을 다시 계산한다 (`shared/theme/colors.ts` 주석).
- 큰 글꼴에서 높이가 커질 수 있는 패널(브랜드 패널, 오류 화면)은 `ScrollView`로 감싼다.

