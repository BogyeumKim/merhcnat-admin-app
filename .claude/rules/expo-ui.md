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

