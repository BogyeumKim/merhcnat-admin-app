# 반응형 UI · 시스템 글꼴 · 키보드 · 로고

로그인 화면(`BrandedLayout` + `BrandedFormScreen`)에서 구현하고 이후 모든 화면의 기준으로 삼는다. **기기에서 실행해 확인한 것은 아직 없다.** 근거는 설치된 `@expo/ui`/Expo 소스와 공식 문서이며, 기기 확인이 필요한 항목은 "미확인"으로 표시했다.

## 요구사항 (사용자)

- 가로/세로, Galaxy Fold·iPhone 접이식(문서상 "iPhone Duo")에서 최적화. flex/grid 같은 실무 레이아웃.
- 작은 화면(iPhone SE/mini 등)에서도 깨지지 않음.
- 시스템 글꼴 크기를 최대로 키워도 글자가 잘리지 않고 아래로 흘러내림.
- 입력 중 키보드가 입력창을 가리지 않음.

## 1. 레이아웃은 "기기"가 아니라 "창 크기"를 본다

- `useWindowLayout()`(`shared/theme/layout.ts`): 너비 breakpoint **600dp, 840dp** (Material window size class 구분. 일반 지식, 이번 세션에서 문서 재확인 안 함), 가로 여부, `isShort`(높이 < 520), `fontScale`.
- **두 단(좌: 브랜드 / 우: 폼)**: 너비 ≥ 840 이거나, 너비 ≥ 600 이면서 가로. 접이식을 펼친 화면, 태블릿, 가로 폰.
- **한 단**: 그 외. 폼 최대 너비 480dp, 가운데 정렬.
- 로고는 세로 공간이 부족하면 숨긴다: `isShort`(가로 폰, 분할 화면) 또는 `fontScale > 1.5`. 제목이 브랜드 역할을 대신한다.
- 높이를 `height`로 고정하지 않는다. 폼은 `ScrollView`(네이티브) 안에 있어 어떤 높이에서도 도달 가능하다.
- `app.json`의 `orientation`을 `default`로 풀었다 (세로 고정이면 가로/펼침 레이아웃을 쓸 수 없다). SDK 58 changelog: iOS 27 SDK로 빌드하면 앱이 리사이즈 가능해지고 `ScreenOrientation.lockAsync`가 무효일 수 있다 → **어떤 크기에서도 깨지지 않아야 한다**.
- 힌지: SDK 58의 `expo-hinge`는 힌지 각도/상태용이고 레이아웃용이 아니라는 Apple 권고가 changelog에 있다. 도입하지 않았다. 컨트롤을 힌지 위에 걸치지 않게 하는 처리(Android 접이식 posture)는 **미구현/미확인**.

## 2. 시스템 글꼴 크기

| 항목 | 방식 | 근거 |
| --- | --- | --- |
| 일반 문구 | React Native `Text`(`AppText`). 기본이 시스템 글꼴 크기 추종, 줄바꿈 | RN 기본 `allowFontScaling` |
| `@expo/ui` 안의 문구 | `NativeText` (플랫폼 파일 분리) | 아래 |
| 입력창/버튼 | `fontSize`를 **지정하지 않는다**. 네이티브 기본 글꼴이 크기를 따른다 | |

**`@expo/ui` `Text`의 함정 (소스 확인):**
- iOS: universal `Text`에 `textStyle.fontSize`를 주면 SwiftUI `font({ size })`가 되고, 이는 **고정 크기라 Dynamic Type으로 커지지 않는다** (modifier 주석: "Fixed-size system font (no Dynamic Type scaling)"). 커지게 하려면 `font({ textStyle: 'title2' })` 같은 SwiftUI text style을 쓴다.
- Android: `fontSize`는 Compose `sp`로 변환되어(`TextView.kt`) 시스템 글꼴 크기를 따른다.
- 그래서 `native-text.ios.tsx`는 text style 모디파이어(+ `isHeader` 접근성 trait), 기본 파일(Android)은 `fontSize`를 쓴다.

**금지:** `allowFontScaling={false}`, 본문에 `maxFontSizeMultiplier` 상한, RN 텍스트 `lineHeight` 고정값(큰 글꼴에서 글자가 잘림. `type` 토큰에 lineHeight 없음), `numberOfLines`로 의미 있는 문구 자르기.

미확인: iOS 접근성 최대 크기(accessibility5)와 Android 200%에서 실제 줄바꿈/스크롤 동작.

## 3. 키보드: 네이티브 방식을 쓴다 (react-native-keyboard-controller 미사용)

**결정 근거**
- Expo 키보드 가이드는 복잡한 폼에 `react-native-keyboard-controller`(`KeyboardAwareScrollView`)를 권한다 (Expo Go에는 없고 개발 빌드 필요).
- 그러나 `KeyboardAwareScrollView`는 포커스된 입력창을 네이티브에서 찾아 스크롤하는데, **Android 구현(`FocusedInputObserver.kt`)이 `newFocus is EditText`일 때만 동작**한다. `@expo/ui`의 Android 입력창은 Compose라서 `EditText`가 아니다 → 자동 스크롤이 동작하지 않을 가능성이 높다 (소스 확인, 기기 미확인).
- `@expo/ui`는 키보드를 네이티브에서 다룬다:
  - **iOS:** SwiftUI는 기본으로 키보드 세이프에어리어를 적용한다. `Host`의 `ignoreSafeArea="keyboard"`는 끄는 옵션이다 (`SafeAreaRegionOptions.swift`).
  - **Android:** `Host`가 `WindowInsets.ime`를 읽어 뷰포트 크기를 계산하고(`HostView.kt`, `useViewportSizeMeasurement`), `imePadding()` 모디파이어를 제공한다 (`ModifierRegistry.kt`).
  - 호스팅된 입력창은 RN의 포커스 조정(`TextInputState`)에 참여한다 → `Keyboard.dismiss()` 등이 동작 (`build/keyboard/interop.js`).
- 따라서 폼 본문을 **하나의 `Host` 안 네이티브 스크롤**(`NativeFormScroll`)로 만들었다:
  - iOS: SwiftUI `ScrollView` + `scrollDismissesKeyboard('interactively')`.
  - Android: Compose `verticalScroll` + `imePadding()`. Host는 시스템바 아래까지 확장되고 `bottomInset`만큼 콘텐츠 하단 패딩을 준다.
- 스크롤 뷰의 패딩은 안쪽 `FormColumn`에 둔다. 스크롤 뷰에 직접 주면(universal ScrollView는 패딩 → `imePadding()` → 스크롤 순으로 모디파이어를 쌓는다) 패딩이 스크롤 영역 밖에 있어 내용이 잘리고, Android에서 하단 인셋이 `imePadding()`과 겹쳐 계산된다.
- 스크롤이 필요 없을 만큼 짧은 폼에서는 스크롤이 일어나지 않고, 길면(작은 화면·큰 글꼴) 스크롤로 입력창에 도달한다. "스크롤 없이 보이게"를 위해 폼을 짧게 유지(필드 2개 + 버튼)하고 로고를 접는다.

**미확인(기기 테스트 필요)**
- iOS: SwiftUI `ScrollView`가 포커스된 `TextField`를 자동으로 보이게 스크롤하는지(`Form`/`List`와 달리 일반 `ScrollView`는 보장이 약하다는 보고가 있다).
- Android: Compose가 `imePadding()` + 스크롤 안에서 커서를 보이게 하는지, edge-to-edge에서 RN 루트가 인셋을 소비하는지.
- **실패 시 대안(순서):** ① Host `useViewportSizeMeasurement` 시도 ② `react-native-keyboard-controller`의 `KeyboardAvoidingView`(포커스 감지가 필요 없는 컴포넌트)로 Host를 감싸기 (`npx expo install react-native-keyboard-controller`, `KeyboardProvider` 필요) ③ 입력창에 `onFocus`로 직접 스크롤.

## 4. 로고(SVG)

- 기존 앱 로고(`mms-mobile/src/assets/image/korpayLogo.png`: 빨간 둥근 사각형 안의 흰 K, 차콜색 `Kor` + 빨간 `pay`)의 정체성을 유지해 다시 그렸다: **빨간 원 안의 흰 K + 차콜 `Kor` + 빨간 `pay`**. 브랜드 빨강은 레거시 상수 `CustomColor.mainColor`(`#ff003a`)다.
- `assets/images/korpay-logo.svg`(viewBox `0 0 376 88`)를 `expo-image`로 렌더한다 (`BrandLogo`). 이미 설치돼 있고 SVG를 네이티브 디코더로 그리며 캐시된다.
- SDK 58 `svgVariables`로 색을 바꾼다: `--korpay-ink`(`Kor`와 다크 모드 대응), `--korpay-brand`(빨강). `var(--x, 기본값)`이라 변수를 안 줘도 기본색으로 그려진다 (Expo 문서).
- 빨강 `#ff003a`는 흰색과 3.95:1이라 **텍스트/버튼 색으로 쓰지 않는다** (로고 같은 그래픽은 대비 규정에서 제외). 버튼/링크는 `action` 색.
- **iOS 시스템 SVG 디코더 제약**: `A/a`(타원 호) 명령이 일부 깨질 수 있다고 문서가 경고 → 로고는 `M/L/C/V`와 `<circle>`만 쓴다. 호 명령을 추가하지 않는다.
- Expo의 `react-native-svg` 문서는 SVG를 컴포넌트로 바꿔 쓰는 방식(SVGR)이다. 정적 로고에는 필요 없어 로고에는 쓰지 않았다. (`react-native-svg`는 `sonner-native`의 peer 의존성으로 설치돼 있다.)
- Android는 `viewBox`를 지우지 않아야 한다 (Expo SVG 문서). 로고를 고치면 `brand-logo.tsx`의 `LOGO_ASPECT_RATIO`(376/88)도 같이 맞춘다.
- 로컬 미리보기: `qlmanage -t -s 900 -o <dir> assets/images/korpay-logo.svg`.

## 5. 기기 테스트 체크리스트

| 시나리오 | 확인 |
| --- | --- |
| iPhone SE/mini 세로 | 폼 전체 도달, 로고/제목 겹침 없음 |
| 글꼴 최대(iOS accessibility5 / Android 200%) | 모든 문구 줄바꿈, 버튼·입력창 잘림 없음, 스크롤로 도달 |
| 키보드 열림 (아이디/비밀번호/인증번호) | 입력 중인 필드와 로그인 버튼 도달 가능 |
| 가로 폰 | 두 단 레이아웃, 로고 축소, 폼 스크롤 |
| 폴드 접힘/펼침 전환(회전 포함) | 레이아웃 재구성, 입력 중이던 텍스트 유지 |
| 다크 모드 | 필드/글자/로고 대비 |
| 분할 화면/리사이즈 | 좁은 창에서도 깨지지 않음 |

## 6. 참고

- https://docs.expo.dev/guides/keyboard-handling/
- https://docs.expo.dev/versions/v58.0.0/sdk/image/ (SVG, `svgVariables`)
- https://docs.expo.dev/versions/v58.0.0/sdk/svg/
- 설치본 소스: `node_modules/@expo/ui/**`, `node_modules/react-native-keyboard-controller/android/**` (제거 전 확인)
