# 개별 패키지 변경 (참조용)

| 패키지 | 변경 |
| --- | --- |
| expo-camera | `CameraView.scanDocumentAsync` 다중 페이지 문서 스캔 |
| expo-file-system | `File.digest()`(MD5/SHA-1/256/384/512), `File.preview()`, `File.canPreview()` |
| expo-audio | 플레이리스트 잠금화면 컨트롤, WAV/PCM 녹음(`AudioStream.startFileRecordingAsync`) |
| expo-image | `transition.skipOnCacheHit`, `svgVariables` (SVG의 CSS 변수; 미지정 시 `var()` fallback) |
| expo-secure-store | Android `requireConfirmation` |
| expo | `URL`/`URLSearchParams` 재작성(IDNA/TR-46), `TextDecoder` 고속화 |
| expo-sqlite | `interruptSync()`, `configureWeb()`(web FTS), libSQL 제거 |
| expo-font | Android/iOS/web 가변 폰트 (`useFonts`, `loadAsync`, config plugin) |
| expo-notifications | iOS `threadIdentifier`/외부 delegate 전달, Android `delivery: 'alarmClock'`, `largeIcon` |
| expo-location | 신규 `expo-location/next` (provider 추상화, watcher, 백그라운드), iOS geofencing은 `location` background mode 불필요 |
| expo-widgets | Android 신규 구현, iOS Live Activity `staleDate` |
| expo-observe | `errorHandlingEnabled`, `Observe.clientId`; `AppMetrics` deprecated |
