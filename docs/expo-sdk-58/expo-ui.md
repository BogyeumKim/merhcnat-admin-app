# @expo/ui (SDK 58)

이 프로젝트의 **기본 UI 레이어**. iOS는 SwiftUI, Android는 Jetpack Compose, Web은 react-native-web/DOM.

## 선택 순서

1. **Universal** (`@expo/ui` 루트 import): `Host`, `Column`, `Row`, `Spacer`, `ScrollView`, `Text`, `Icon`, `Button`, `Switch`, `Checkbox`, `Slider`, `TextInput`, `Picker`, `BottomSheet`, `Collapsible`, `List`/`ListItem`, `FieldGroup`.
2. **플랫폼별**: `@expo/ui/swift-ui`(iOS 전용), `@expo/ui/jetpack-compose`(Android 전용). universal에 없을 때만. `.ios.tsx`/`.android.tsx`로 분리하고 `components/`에 둔다 (`app/` 안 금지).
3. RN 내장은 `@expo/ui`에 없을 때만.

모든 `@expo/ui` 트리는 `Host`로 감싼다. `Host`는 항상 `@expo/ui` 루트에서 import.

## SDK 58 변경점

**리사이클링 리스트(가상화)**
- iOS: `List`, `LazyVStack`, `LazyHStack` / Android: `LazyColumn`, `LazyRow`
- `data`, `keyExtractor`, `children` 함수 사용. `List.ForEach`, `LazyVStack.ForEach`, `LazyHStack.ForEach`(SwiftUI), `LazyColumn.Items`, `LazyRow.Items`(Compose).
- `List.ForEach`에 element를 children으로 직접 넘기는 방식은 **deprecated**.
- 주의: universal `List`/`ListItem`은 설정 화면 같은 짧은 그룹용. 대용량 데이터는 플랫폼별 recycling 리스트 또는 `FlatList`/`FlashList`.

**iOS 내비게이션**: `NavigationStack`, `Toolbar`, `NavigationLink`, `NavigationDestination`, `navigationTitle`, `NavigationSplitView`(2/3 컬럼), `ToolbarItem`의 `placement`/`visibilityPriority`. 앱 내비게이션 자체는 Expo Router가 담당.

**SwiftUI 스타일링**: `background`, `tint`, `border`, `strokeBorder`, `containerBackground`, `presentationBackground`, `foregroundStyle`이 `ShapeStyle`(material, gradient) 허용. 신규 `Background` 컴포넌트와 여러 modifier.

**Compose**: `Image`, `DateRangePicker(Dialog)`, `VerticalSlider`, `DropdownMenu`의 `cornerRadius`/`shadowElevation`.

**Universal**: `BottomSheet`에 `contentPadding`, `containerColor`, `contentColor`. `ListItem`에 `colors`. Web `BottomSheet`는 `<dialog>` 기반(vaul 제거).

**RNHostView**: 측정 보정으로 `BottomSheet`/`Popover`/`AlertDialog`/`DropdownMenu` 내부 터치 정상화.

## Breaking / Deprecated

- iOS `<Host>`는 내용을 **상단 정렬** (이전: 가운데).
- `HStack`/`VStack`/`GlassEffectContainer`: `spacing` 미지정 → SwiftUI 기본 간격. 예전 레이아웃은 `spacing={0}`.
- Android `RNHostView`의 `style` 제거 → `modifiers`.
- iOS `backgroundOverlay` → `background`; `border`/`strokeBorder`의 `color` → `content`.
- Android `HorizontalCenteredHeroCarousel.maxItemWidth` → `preferredItemWidth`; `TimePicker`의 `Unselected` 색 이름 5종 → Material 3 이름.

## 사용 규칙

- `TextInput`의 `value`/`selection`은 문자열이 아니라 `useNativeState`가 만든 상태 객체. `onChangeText`는 worklet(`'worklet'`). `react-native-worklets` 필요.
- `BottomSheet`: `isPresented`/`onDismiss`/`snapPoints`. (`isOpen` 등 다른 라이브러리 prop 금지)
- 컴포넌트 시그니처가 불확실하면 https://docs.expo.dev/versions/v58.0.0/sdk/ui/ 에서 확인.
