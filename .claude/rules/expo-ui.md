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
- 버튼은 `NativeButton`, 입력창은 `LabeledField`/`NativeField`, 문구는 `NativeText`를 쓴다. `@expo/ui`의 `Button`/`TextInput`/`Text`를 화면에서 직접 쓰지 않는다 (touch target, 라벨, 글꼴 크기 정책이 여기에 모여 있다).
- 폼 오류 UI: 필드 아래 오류는 `LabeledField error`, 폼 전체의 지속 오류는 `FormAlert`. 규칙은 `.claude/rules/feedback-ux.md`.
- **iOS 폭 `'100%'` 함정 (58.0.23, 시뮬레이터로 확인)**: universal `ScrollView`(iOS)는 자식을 일반 SwiftUI `VStack`으로 감싸 그 아래 모든 `width: '100%'`가 무시되고 입력창/버튼이 내용 폭으로 줄어든다. 그래서 `native-form-scroll.ios.tsx`는 `@expo/ui/swift-ui`의 `ScrollView`를 직접 쓴다. SwiftUI `Button` 라벨 안의 `Column`도 퍼센트가 풀리지 않으므로 `native-button.ios.tsx`는 `frame({ maxWidth: Infinity })`로 채운다. 새 폼 화면은 반드시 `NativeFormScroll`을 쓰고, 화면에서 universal `ScrollView`를 직접 쓰지 않는다.
- **스크롤/텍스트도 `@expo/ui`**: 화면 본문은 RN `ScrollView`/`Text`를 쓰지 않는다. `NativeHost` + `NativeFormScroll` + `NativeText`/`NativeButton`을 쓴다 (`TabScreen`, `ErrorScreen`, `BrandedFormScreen`이 이 패턴). 창 크기 분기용 RN `View` 래퍼만 예외.
- **iOS 둥근 테두리 함정 (시뮬레이터로 확인)**: universal `borderWidth` + `borderRadius`는 직사각형 `border` 뒤에 `clipShape`가 걸려 둥근 모서리 쪽 테두리가 잘려 나간다. `strokeBorder` modifier(둥근 모양을 따라 선을 그림)를 쓴다. iOS `TextInput`은 `modifiers`를 스타일 파생 modifier보다 안쪽에 적용하므로 박스 테두리는 `TextInput`이 아니라 바깥 `Column`에 둬야 한다. 현재 입력창은 박스 없이 밑줄(`field-underline.tsx`)이고 `FormAlert`도 박스가 아니라 아이콘 + 문구라 이 함정을 피한다.
- 새 `.ios.tsx`/`.android.tsx` 파일을 추가한 직후 Metro가 기본 파일을 계속 쓰면, 그 파일을 import하는 쪽 파일을 한 번 저장(touch)하거나 `npx expo start --clear`.

- **하단 고정 버튼**: `BrandedFormScreen`/`SheetFormScreen`의 `footer`로 넘긴다 (`NativeFormScroll`이 스크롤 영역 + footer를 한 `Host` 안의 `Column`으로 구성하고, 키보드 위에 둔다. Android는 스크롤에 `weight(1)`, 컬럼에 `imePadding()`).
- 입력창은 `LabeledField`(라벨 + 밑줄 `NativeField` + 오류). 비밀번호 보기/숨기기는 눈 아이콘(`PasswordToggle`: iOS SF Symbols, Android `@expo/material-symbols`)이다. 58.0.23의 iOS `Icon`은 접근성 prop이 없어서 `accessibilityLabel` modifier로 라벨을 준다. 끝에 컨트롤이 필요하면 `trailing`.
- iOS 아이콘이 `eye`/`eye.slash`처럼 높이가 다르면 토글할 때 행 높이가 바뀐다. 아이콘 컨트롤은 고정 프레임(`PasswordToggle`은 44pt 정사각형)에 넣는다. 버튼 라벨은 `font({ textStyle: 'headline' })`(17pt semibold), 세로 패딩 8pt(버튼 스타일이 약 11pt를 더해 높이 약 49pt).
- **인증 단계(sheet) 구성**: 각 단계(`DeviceNotice`/`MethodChoice`/`CodeEntry`)가 `SheetFormScreen`(+`footer`)을 직접 그린다. 머리는 `StepHeader`(아이콘 배지 + 제목 + 한 줄). 채널 선택은 `ListItem` 행(+ `FieldUnderline` 구분선, 세로 여백 `Column`), 코드 입력은 큰 숫자·넓은 자간의 단일 `NativeField`(마지막 자리에서 자동 제출, 상태는 "가득 찼는가" 불리언만).
- **form sheet 배경**: 투명(Liquid Glass)은 iOS 26+에서만. 그 미만 iOS는 투명이면 뒤 화면이 비쳐 보이므로 단색(`colors.background`) (`app/_layout.tsx`의 `SHEET_IS_GLASS`).
- **Android 실기 확인에서 나온 함정 (에뮬레이터 API 35, 개발 빌드)**:
  - 자식 없는 `Column`(높이 + 배경만)은 Compose에서 아무것도 그리지 않는다. 구분선/밑줄은 `HorizontalDivider`를 쓴다 (`field-underline.android.tsx`).
  - Android `Icon`에 `onPress`를 주면 정확히 `size`짜리 `Box`가 되어, 그 `Icon`에 `padding`을 주면 글리프가 점으로 줄어든다. 터치 영역 패딩과 `onPress`는 감싸는 `Column`에 둔다 (`password-toggle.tsx`).
  - Host의 `seedColor`로 생성되는 Material 색 체계에서는 빨강 seed의 primary가 칙칙한 갈색이 된다. 브랜드 색 버튼은 `colors`를 명시한다 (`native-button.android.tsx`: `containerColor`/`contentColor`).
  - 고정 크기 아이콘 + 배지는 `Column`의 `padding`(아이콘 크기 + 균등 패딩)으로 만든다. 고정 크기 `Column` 안의 `Icon`은 가운데에 오지 않는다 (`step-header.tsx`).
  - form sheet에 **부분 높이 detent(0.7 등)를 쓰면 Android는 레이아웃이 전체 높이로 잡혀 하단 `footer`가 화면 밖에 있다.** Android는 `[1]`(전체 높이)로 한다 (`app/_layout.tsx`). 또한 Android에서는 `gestureEnabled: false`가 시트 스와이프 닫기를 막지 못했다 (취소 버튼이 아닌 스와이프로 닫히면 챌린지 토큰이 메모리에 남는다: 5분 뒤 자동 폐기).

