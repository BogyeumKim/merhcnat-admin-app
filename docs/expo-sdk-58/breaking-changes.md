# Breaking Changes & Deprecations 체크리스트

## 코드에서 확인할 것

- [ ] `react-native/Libraries/*` deep import 금지 (Strict TypeScript API, 타입 오류). ref 타입 변경(`ViewInstance`, `TextInputInstance`). 임시 우회: tsconfig `customConditions: ["react-native", "react-native-legacy-deep-imports"]` — RN 0.89 이후 제거 예정이므로 **사용하지 않는다**.
- [ ] `InteractionManager` 제거 → `requestIdleCallback`
- [ ] `Touchable` 루트 export, `NativeMethods` 타입 제거
- [ ] `Modal`의 `animated` prop 제거
- [ ] `StatusBar`의 `backgroundColor`/`translucent`/`networkActivityIndicatorVisible` 제거
- [ ] `ImageBackground` deprecated → `expo-image` 등 사용
- [ ] `expo-file-system`: `File.write()`는 async. 동기는 `File.writeSync()`. `File.md5` → `File.digest()`
- [ ] `expo-sqlite`: libSQL 제거 (`syncLibSQL`, `libSQLOptions`, `useLibSQL`)
- [ ] `expo-notifications`: 포그라운드 알림이 기본 표시 → `setNotificationHandler`로 제어
- [ ] `expo-localization` (iOS): `supportsRTL`이 RTL을 강제하지 않음, `I18nManager` 기준
- [ ] `expo-media-library`: 비디오 URI가 현재 Photos 버전. 원본은 `AssetUriVersion.ORIGINAL`
- [ ] `expo-observe`: `AppMetrics` → `Observe`
- [ ] `expo-modules-core`: `NativeArrayBuffer` → `ArrayBuffer`
- [ ] `expo-router`: `withLayoutContext` → `integrateWithRouter`
- [ ] `@expo/ui` 항목은 `expo-ui.md` 참고
- [ ] `expo-linking`: `Linking.parse()`가 더 이상 query 값을 이중 디코딩하지 않음

## 빌드/환경

- **`NODE_ENV`**는 실행 명령이 결정 (`development`/`production`)하며 다른 값을 덮어씀. `NODE_ENV=test npx expo start`는 `.env.development` 로드. Debug 빌드=development, 그 외(`Staging` 같은 커스텀 포함)=production.
- **Android R8** 릴리스 빌드 기본 활성(`android.enableMinifyInReleaseBuilds=true`). reflection 사용 라이브러리는 ProGuard keep 규칙 필요. 끄려면 `expo-build-properties`.
- **Fingerprint** 기본 preset `balanced` (`version` 변경 무시).
- `expo login`은 브라우저 기반이 기본 (`--no-browser`로 이전 방식). `expo serve`는 `expo export --dev`로 만든 서버 코드 포함 export를 거부.
- `expo start --tunnel`은 `@expo/ws-tunnel`이 기본 (`expo login` 필요). 이전 방식은 `--tunnel ngrok`.
