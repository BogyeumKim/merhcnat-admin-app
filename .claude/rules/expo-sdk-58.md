# Expo SDK 58 공통 규칙

- 패키지는 `npx expo install <pkg>`로만 추가한다. `npm install <pkg>` 직접 사용 금지.
- API가 불확실하면 `docs/expo-sdk-58/`와 https://docs.expo.dev/versions/v58.0.0/ 를 먼저 확인한다. 기억에 의존하지 않는다.
- 폐기/제거된 API는 사용하지 않는다 (`docs/expo-sdk-58/breaking-changes.md`): `InteractionManager`, `ImageBackground`, `Modal animated`, `StatusBar` 안드로이드 전용 prop, `File.md5`, `withLayoutContext`, `AppMetrics` 등.
- `react-native/Libraries/*` deep import 금지. `react-native-legacy-deep-imports` 우회 조건도 쓰지 않는다.
- `ios/`, `android/` 수동 생성/수정 금지 (CNG). 네이티브 설정은 `app.json` + config plugin.
- 네이티브 코드를 가진 라이브러리를 추가하면 로컬 재빌드(`npx expo prebuild` 후 `run:ios|android`)가 필요함을 사용자에게 알린다. EAS development build는 쓰지 않는다.
- 앱 설정(`app.json`)을 바꾼 뒤 네이티브에 반영하려면 `npx expo prebuild --clean`. `ios/`, `android/`를 직접 수정하지 않는다.
- Node 22.13+ / 24.3+ / 26+ 만 지원 (홀수 릴리스 불가).
- `NODE_ENV`는 실행 명령이 결정한다. 코드에서 임의로 덮어쓰지 않는다.
- 환경 변수는 클라이언트에 노출되는 `EXPO_PUBLIC_*`에 비밀 값을 넣지 않는다.
- 로컬 Node는 22.13+ / 24.3+ / 26+ 여야 한다. 다른 버전이면 `expo lint` 등 CLI가 경고하므로 사용자에게 알린다.
- `expo-router`에서 `Tabs`를 import하지 않는다 (deprecated). `expo-router/js-tabs`를 쓴다. NativeTabs는 `expo-router/native-tabs`.
