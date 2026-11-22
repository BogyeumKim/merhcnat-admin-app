---
paths:
  - "src/**/*.tsx"
---

# @expo/ui 사용 규칙

- UI는 `@expo/ui`를 기본으로 한다. 순서: universal(`@expo/ui`) → 플랫폼별(`@expo/ui/swift-ui`, `@expo/ui/jetpack-compose`) → RN 내장(컴포넌트가 없을 때만).
- 바텀시트, 피커, 슬라이더, 스위치, 메뉴, 폼 섹션에 Reanimated 직접 구현·`@gorhom/bottom-sheet`·RN `Picker`/`Switch`를 쓰지 않는다.
- 모든 `@expo/ui` 트리는 `Host`로 감싼다. `Host`는 `@expo/ui` 루트에서만 import.
- `@expo/ui/swift-ui`는 iOS 전용, `@expo/ui/jetpack-compose`는 Android 전용. 다른 플랫폼에서 import하면 런타임 크래시. `.ios.tsx`/`.android.tsx`로 분리하고 feature의 `components/`(공용이면 `shared/ui/`)에 둔다 (`src/app/` 안에서는 플랫폼 확장자 불가). 같은 이름의 기본 파일도 함께 둔다.
- `BottomSheet`는 `isPresented` / `onDismiss` / `snapPoints`. 다른 라이브러리의 prop(`isOpen`, `onChange`)을 쓰지 않는다.
- `TextInput`의 `value`는 `useNativeState` 객체이고 `onChangeText`는 `'worklet'`이다.
- universal `List`/`ListItem`은 짧은 고정 그룹(설정, 상세 행)용. 대용량·가변 데이터는 플랫폼별 recycling 리스트(`LazyColumn`/`LazyVStack` + `data`/`keyExtractor`) 또는 `FlatList`/`FlashList`.
- SDK 58: `List.ForEach` children에 element를 직접 넘기지 않는다 (deprecated). `data` + children 함수 사용.
- SDK 58: iOS `Host`는 상단 정렬, `HStack`/`VStack` `spacing` 미지정은 시스템 기본 간격. 이전 레이아웃이 필요하면 `spacing={0}`을 명시한다.
- Android `RNHostView`에는 `style` 대신 `modifiers`.
- 컴포넌트/modifier 시그니처는 추측하지 말고 `expo-ui` skill 또는 v58 문서로 확인한다.

## 아이콘 (중앙 맵)

- 아이콘은 **`src/shared/ui/icons.ts`의 `icons.<의미 이름>`으로만** 쓴다 (한 feature만 쓰는 아이콘은 그 feature의 `model/icons.ts`에 이름으로 정의할 수 있지만, 기본은 공용 맵). 컴포넌트/화면에 `{ ios: ..., android: ... }`를 인라인으로 쓰거나 `@expo/material-symbols`·`assets/icons/*.xml`을 직접 import하지 않는다. 훅 `check-icon-map.sh`가 차단한다.
- iOS SF Symbols(Apple HIG) + Android Material Symbols(Material 3)로 플랫폼별 세트가 다른 것은 의도된 선택이다. `@expo/ui` `Icon`은 두 플랫폼 공통 세트가 없다.
- 맵 항목은 `Icon.select({ ios: '<SF Symbol>', android: import('@expo/material-symbols/<name>.xml') })` 형태(객체 리터럴 인자)를 지킨다. `@expo/ui` babel 플러그인이 플랫폼 값으로 치환해 다른 플랫폼 에셋이 번들에서 빠진다. 평범한 `{ ios, android }` 객체는 양쪽 에셋이 다 실린다.
- 하단 탭 아이콘은 `NativeTabs` API(`sf`/`md` 이름 문자열)가 달라 `core/navigation/app-tabs/config/tabs.ts`에만 둔다.

## 성능

- 정적 값(Shape, modifier 인자 객체, 색 팔레트, 아이콘 source)은 모듈 스코프 상수로 둔다. 렌더마다 새 객체를 만들면 네이티브 prop diff 비용이 생긴다. (React Compiler가 일부 자동 처리하지만 네이티브 prop 객체는 명시적으로 hoist한다.)
- `Host`는 가능한 한 적게 만들고, 하나의 `Host` 안에서 트리를 구성한다 (권장 원칙. 수치로 검증한 값은 아님).
- 리스트 항목마다 `Host`를 만들지 않는다.
- `useColorScheme()`은 `null`을 반환할 수 있다. `Host`의 `colorScheme`에는 `'light' | 'dark'`로 정규화해서 넘긴다.
- Android 전용 Compose 코드는 `*.android.tsx`에서만 import하고, 기본 파일/iOS 번들에 섞이지 않게 한다.

## 구현에서 확인한 사실 (SDK 58 설치본 소스 기준)

- universal `Text`의 `textStyle.fontSize`는 iOS에서 **고정 크기**(Dynamic Type 미적용), Android에서는 `sp`. iOS에서 크기를 따라가게 하려면 `font({ textStyle })` 모디파이어. 프로젝트의 `NativeText`가 플랫폼 파일로 처리한다. 입력창/버튼에는 `fontSize`를 주지 않는다.
- universal `TextInput`: `value`는 `useNativeState` 객체, `onChangeText`/`onSubmitEditing`/`onFocus`/`ref.focus()` 지원, `secureTextEntry`(iOS `SecureField`), `autoComplete`(iOS `textContentType`, Android Compose contentType), `keyboardType`, `returnKeyType`, `maxLength`. 입력값 전체를 React state로 복사하지 않는다 (필요한 불리언만 상태로 올린다).
- 호스팅된 입력창은 RN의 `TextInputState`(포커스/블러)에 참여한다: `Keyboard.dismiss()`가 동작한다.
- 키보드/스크롤은 네이티브가 맡는다 (`docs/architecture/responsive-ui.md`). iOS는 SwiftUI 키보드 세이프에어리어, Android는 `imePadding()` 또는 Host의 `useViewportSizeMeasurement`.
- 플랫폼 전용 모디파이어(`@expo/ui/swift-ui/modifiers`, `@expo/ui/jetpack-compose/modifiers`)는 `*.ios.tsx`와 기본 파일 쌍으로 분리해 import한다.
- Android 전용 Compose 모디파이어는 `*.android.tsx`에만 둔다 (기본 파일은 플랫폼 중립 폴백). `native-form-scroll`, `native-text`(iOS), `native-button`(iOS)이 이 패턴이다.
- `NativeText`의 `selectable`(길게 눌러 복사)·`tabular`(고정 폭 숫자)는 iOS `textSelection(true)`/`monospacedDigit()`. 58.0.29 Android에는 `SelectionContainer`·`fontFeatureSettings`가 노출되지 않아 무시된다(Roboto 숫자는 기본이 고정 폭).
- 버튼은 `NativeButton`, 입력창은 `LabeledField`/`NativeField`, 문구는 `NativeText`를 쓴다. `@expo/ui`의 `Button`/`TextInput`/`Text`를 화면에서 직접 쓰지 않는다 (touch target, 라벨, 글꼴 크기 정책이 여기에 모여 있다).
- 폼 오류 UI: 필드 아래 오류는 `LabeledField error`, 폼 전체의 지속 오류는 `FormAlert`. 규칙은 `.claude/rules/feedback-ux.md`.
- **iOS 폭 `'100%'` 함정 (58.0.23, 시뮬레이터로 확인)**: universal `ScrollView`(iOS)는 자식을 일반 SwiftUI `VStack`으로 감싸 그 아래 모든 `width: '100%'`가 무시되고 입력창/버튼이 내용 폭으로 줄어든다. 그래서 `native-form-scroll.ios.tsx`는 `@expo/ui/swift-ui`의 `ScrollView`를 직접 쓴다. SwiftUI `Button` 라벨 안의 `Column`도 퍼센트가 풀리지 않으므로 `native-button.ios.tsx`는 `frame({ maxWidth: Infinity })`로 채운다. 새 폼 화면은 반드시 `NativeFormScroll`을 쓰고, 화면에서 universal `ScrollView`를 직접 쓰지 않는다.
- `TabScreen`은 네이티브 Stack 헤더가 보이면(`HeaderShownContext`) 위쪽 safe area를 더하지 않는다.
- **스크롤/텍스트도 `@expo/ui`**: 화면 본문은 RN `ScrollView`/`Text`를 쓰지 않는다. `NativeHost` + `NativeFormScroll` + `NativeText`/`NativeButton`을 쓴다 (`TabScreen`, `ErrorScreen`, `BrandedFormScreen`이 이 패턴). 창 크기 분기용 RN `View` 래퍼만 예외.
- **iOS 둥근 테두리 함정 (시뮬레이터로 확인)**: universal `borderWidth` + `borderRadius`는 둥근 모서리 쪽 테두리가 잘려 나간다. 입력창은 Korpay 디자인의 박스(56 높이, 둥근 16, 휴지 상태 `canvas` 채움, 포커스 흰색 + 1.5 잉크 링, 오류 흰색 + danger 링)다. iOS는 `native-field.ios.tsx`가 최소 높이 `frame` 뒤에 `background(shapes.roundedRectangle)` + `strokeBorder`를 modifier로 적용한다(링을 감싸는 Column은 최소 높이 프레임 때문에 두꺼운 띠로 보인다). Android는 링 색 `Column` 안에 채움 `Row`를 둔 이중 둥근 사각형이다(`native-field-base.tsx`).
- 새 `.ios.tsx`/`.android.tsx` 파일을 추가한 직후 Metro가 기본 파일을 계속 쓰면, 그 파일을 import하는 쪽 파일을 한 번 저장(touch)하거나 `npx expo start --clear`.

- **하단 고정 버튼**: `BrandedFormScreen`/`SheetFormScreen`의 `footer`로 넘긴다 (`NativeFormScroll`이 스크롤 영역 + footer를 한 `Host` 안의 `Column`으로 구성하고, 키보드 위에 둔다. Android는 스크롤에 `weight(1)`, 컬럼에 `imePadding()`).
- 입력창은 `LabeledField`(라벨 + 박스형 `NativeField` + 오류). 비밀번호 보기/숨기기는 눈 아이콘(`PasswordToggle`: `icons.passwordShow`/`passwordHide`)이다. 58.0.29의 iOS `Icon`도 `accessibilityLabel` prop을 무시한다(설치본 소스: "iOS accessibility is not yet wired up"). **아이콘만 있는 버튼은 `IconButton`**(`shared/ui/icon-button.*`: iOS는 `accessibilityLabel` modifier + 버튼 trait + 44pt frame, Android는 44dp 패딩 `Column` + `contentDescription`)을 쓰고, 화면에서 `Icon`에 `onPress`를 직접 주지 않는다. 눌리는 `Row`/`Column`(카드, 행)에는 `modifiers={pressableA11y(label?)}`(`shared/ui/pressable-a11y`)를 준다: iOS는 자식을 한 요소로 합치고 버튼 trait를 더한다(없으면 VoiceOver가 문구를 따로 읽고 버튼임을 모른다). 끝에 컨트롤이 필요하면 `trailing`.
- iOS 아이콘이 `eye`/`eye.slash`처럼 높이가 다르면 토글할 때 행 높이가 바뀐다. 아이콘 컨트롤은 고정 프레임(`PasswordToggle`은 44pt 정사각형)에 넣는다. 버튼 라벨은 `font({ textStyle: 'headline' })`(17pt semibold), 세로 패딩 12pt(버튼 스타일이 약 11pt를 더해 높이 약 57pt, 디자인 56). 텍스트 링크 `LinkText`도 위아래 12pt로 44pt 터치 높이를 맞춘다.
- **인증 단계(sheet) 구성**: 각 단계(`DeviceNotice`/`MethodChoice`/`CodeEntry`)가 `SheetFormScreen`(+`footer`)을 직접 그린다. 머리는 `StepHeader`(아이콘 배지 + 제목 + 한 줄). 채널 선택은 `ListItem` 행(+ `FieldUnderline` 구분선, 세로 여백 `Column`), 코드 입력은 큰 숫자·넓은 자간의 단일 `NativeField`(마지막 자리에서 자동 제출, 상태는 "가득 찼는가" 불리언만).
- **form sheet 그래버**: 아래로 끌어 닫을 수 있는 시트(verify, login-help, notice-popup)만 보인다. iOS는 `sheetGrabberVisible: true`(`core/navigation/root-stack.tsx` `sheetOptions`). Android는 react-native-screens 4.30.1이 이 값을 그리지 않으므로 `SheetGrabber`(`shared/ui/sheet-grabber`, M3 32×4dp, `sheetHandle` 토큰, 접근성 숨김)를 내용이 그린다: `SheetFormScreen grabber`(상단 패딩 안에 겹쳐 제목 위치 불변), 공지 시트는 맨 위 한 줄. 닫을 수 없는 시트는 둘 다 끈다.
- **form sheet 닫기**: 닫을 수 있는 form sheet는 그래버와 상단 X 닫기 버튼(`IconButton` + `icons.close`, 44pt)을 **둘 다** 보인다. X는 스와이프 제스처의 한 번 탭 대안(WCAG 2.5.1)이고, 전체 높이 시트는 X가 없으면 시트라는 것(닫을 수 있다는 것)이 드러나지 않는다.
- **시트를 열 때는 `openSheet(href)`(`shared/lib/open-sheet`)만** 쓴다(`router.push`로 form sheet 라우트를 직접 열지 않는다). 띄우기 전에 포커스된 입력란을 블러하고 `onBlur`가 올 때까지 기다린다(Android는 `Keyboard.dismiss()`도, 연타는 무시. `NativeFieldBase`가 `shared/lib/focused-field` 레지스트리에 포커스를 기록). 포커스를 둔 채 띄우면 시트가 닫힐 때 OS가 그 칸에 포커스·키보드를 되돌린다. 값은 유지된다.
- **form sheet 배경**: 항상 단색(`useNativeColors().background`). iOS 26의 투명 form sheet는 Liquid Glass로 그려져 뒤 화면이 글씨 아래로 비쳐 읽기 어렵다 (`core/navigation/root-stack.tsx`의 `*SheetOptions`). 페이지 배경은 시스템 동적 색(`Color.android.dynamic.surface`는 Android 12+에서 연보라)이 아니라 팔레트의 `background`(라이트 흰색, 다크 `#0B0F19`)를 쓴다.
- **Android 실기 확인에서 나온 함정 (에뮬레이터 API 35, 개발 빌드)**:
  - 자식 없는 `Column`(높이 + 배경만)은 Compose에서 아무것도 그리지 않는다. 구분선은 `shared/ui/divider`의 `Divider`를 쓴다 (Android는 Compose `HorizontalDivider`).
  - Android `Icon`에 `onPress`를 주면 정확히 `size`짜리 `Box`가 되어, 그 `Icon`에 `padding`을 주면 글리프가 점으로 줄어든다. 터치 영역 패딩과 `onPress`는 감싸는 `Column`에 둔다 (`password-toggle.tsx`).
  - Host의 `seedColor`로 생성되는 Material 색 체계에서는 빨강 seed의 primary가 칙칙한 갈색이 된다. 브랜드 색 버튼은 `colors`를 명시한다 (`native-button.android.tsx`: `containerColor`/`contentColor`).
  - 고정 크기 아이콘 + 배지는 `Column`의 `padding`(아이콘 크기 + 균등 패딩)으로 만든다. 고정 크기 `Column` 안의 `Icon`은 가운데에 오지 않는다 (`step-header.tsx`).
  - form sheet에 **부분 높이 detent(0.7 등)를 쓰면 Android는 레이아웃이 전체 높이로 잡혀 하단 `footer`가 화면 밖에 있다.** Android는 `[1]`(전체 높이)로 한다 (`core/navigation/root-stack.tsx`). 또한 Android에서는 `gestureEnabled: false`가 시트 스와이프 닫기를 막지 못했다 (취소 버튼이 아닌 스와이프로 닫히면 챌린지 토큰이 메모리에 남는다: 5분 뒤 자동 폐기).
- **필드 끝 "지우기"**: `ClearButton`. 아이콘 하나(`icons.clear`: iOS SF Symbol `xmark.circle.fill`, Android는 채운 cancel 벡터 `assets/icons/cancel-filled.xml`)를 `IconButton`(44pt 터치 영역)으로 그린다. 도형을 겹쳐 직접 그리지 않는다. 아이콘은 에셋(SF Symbol/벡터)으로, 실무 표준. 비밀번호 칸은 값이 있을 때 `[지우기][눈]`.
