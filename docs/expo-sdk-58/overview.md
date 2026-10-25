# SDK 58 개요

## 요구사항

- Node.js **22.13+ / 24.3+ / 26+** (홀수 릴리스 23, 25 미지원)
- React Native 0.88 (0.86에서 상향; 0.87 변경 포함)
- iOS 27 SDK 대응, Android Gradle Plugin 9 호환
- **macOS 미지원** (react-native-macos가 RN 0.86+로 올라올 때까지)
- **Expo Go**: SDK 58용 스토어 버전은 릴리스 시점(2026-10-15)에 아직 없었다. 원문: "will be released within a few weeks". 출시 후에도 SDK 58만 지원하고, "Expo Go is not recommended as a development environment for production apps". → 이 프로젝트는 EAS development build 없이 **로컬 `expo prebuild` + `expo run:ios|android`**로 개발한다. 로컬 iOS 빌드는 Xcode 버전 요건을 먼저 확인할 것(SDK 58은 iOS 27 SDK 대응, 이 개발 머신은 Xcode 16.4). (출시 여부는 App Store / expo.dev/go에서 직접 확인)
  - 새 프로젝트: `npx create-expo-app --template default@sdk-58`

## iOS 27

- UIKit **scene 기반 라이프사이클** 사용. `prebuild`가 `SceneDelegate.swift`와 `UIApplicationSceneManifest`를 생성한다. `AppDelegate.swift`를 커스터마이즈했다면 https://expo.fyi/ios-scene-lifecycle 참고.
- iOS 27 SDK로 빌드한 앱은 **자동으로 리사이즈 가능**. `requireFullScreen`이 리사이즈를 막지 못하고 `ScreenOrientation.lockAsync`가 무효일 수 있다.
- `UIScreen.main`을 읽지 않는다. 레이아웃은 scene 기하 정보 기준.
- `expo-glass-effect`: iOS 27 SDK 빌드에서 `isLiquidGlassAvailable`이 `true`.

## iPhone Duo / 폴더블

- 시스템 내비게이션/탭은 Router `Stack`, `NativeTabs` 또는 Expo UI `<Host>` 사용.
- Safe area 비중 증가: ScrollView 내부 등 가로 inset 처리에 `SafeAreaView` 필요할 수 있음.
- 신규 `expo-hinge` (`useHinge`, `getHinge`, `addHingeListener`) — iOS 27.1+, Android 11+ 폴더블. 힌지 상태는 레이아웃이 아니라 상호작용/효과용.
- Expo UI `ArrangementView`: primary/secondary 뷰를 나란히 또는 오버레이.

## 신규/실험 기능

| 기능 | 상태 | 메모 |
| --- | --- | --- |
| `expo-app-intents` | alpha | Siri/Shortcuts/Spotlight. `npx expo-app-intents init` |
| `expo-device-hub` | dev tool | Xcode 27 Device Hub 연동 대시보드 |
| `expo-widgets` Android | 신규 구현 | 전용 Hermes 런타임, Material Colors |
| SwiftPM | 실험 | **CocoaPods가 기본이며 공식 경로** |
| Expo Modules 2.0 | beta | DSL 없이 일반 Swift/Kotlin 클래스 |
| Noxcturnal | 실험 | `experiments.noxcturnalTransformWorker` — Reanimated/Worklets 파일은 건너뜀 |
| PostHog 연동 | EAS | `eas integrations:posthog:connect` |

## Expo Modules 성능

- Android: `expo-modules-core` 사전 컴파일 `.so` 제공 (clean debug ≈80s → ≈39s). 소스 빌드는 `expo-build-properties`의 `android.buildExpoModulesCoreFromSource`.
- iOS: 긴 문자열 호출 최대 3.8배, 비동기 promise 비용 감소.

## React Native 0.88 포인트

- `fontVariationSettings` (`Text`), TurboModule `ArrayBuffer`, DevTools 성능 스크린샷/WebSocket 검사(실험).
- **Strict TypeScript API** 기본(0.87) — `breaking-changes.md` 참고.

## 업그레이드 절차 (SDK 57 → 58 참고용)

1. `npx expo install expo@^58.0.0 --fix`
2. `npx expo-doctor@latest`
3. 폐기/깨짐 목록 검토 (`breaking-changes.md`)
4. CNG면 `ios/`, `android/` 삭제 후 재생성
5. 로컬에서 `npx expo prebuild --clean` 후 `run:ios` / `run:android`로 재빌드
