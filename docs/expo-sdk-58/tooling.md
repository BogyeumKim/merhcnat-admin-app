# 개발 도구 / CLI (SDK 58)

## 에이전트 친화 도구

- `npx expo command:ps`, `npx expo command:events` (실험): 프로세스/이벤트를 기계가 읽을 수 있는 형태로 출력.
- `EXPO_DEBUG=1` 디버그 로그 출력 형식 변경.
- `@expo/agent-cli` (실험, alias `expo-agent-cli`): `status`(패키지가 Expo Go 번들 모듈과 호환되는지 점검 — 스토어 Expo Go가 SDK 58을 지원하는지와는 별개), `dev`(최단 경로로 앱 실행), `smoke`(dev+스크린샷+종료), `skills:sync`(node_modules의 co-located skill 동기화). 설정: `npx @expo/agent-cli@latest agents:setup`.
- co-located skill 설치 예: `npx @expo/agent-cli@latest install expo-sqlite`

## Device Hub (Xcode 27)

Simulator.app 대체. Expo CLI가 자동 감지. 브라우저 대시보드는 `npx expo install expo-device-hub` 후 `npx expo start`.

## 개발 서버 / 런치 URL

- manifest가 상대 URL 사용(프록시/원격/Bonjour에 유리). `RCTMetroPort`가 `Info.plist`에 기록되어 8081 고정 아님.
- 런치 URL 파라미터(`__expo_` 접두): `__expo_url`, `__expo_disable_onboarding=1`, `__expo_disable_fab=1`, `__expo_disable_auto_launch=1`.
- `EXPO_NO_DEV_MENU=1`: 위 disable 3종을 URL/QR에 추가. 비대화형 CLI에서 기본 on (`=0`으로 해제).
- `expo-linking`: 예약 파라미터 무시, `unwrapDevLaunchURL()` export.

## 번들러

- `@expo/metro-config`: 인라인된 `EXPO_PUBLIC_*` 값이 transform cache에 기록됨. `node_modules` 스택 프레임이 더 이상 접히지 않음.
- Noxcturnal(실험): 이 프로젝트는 Reanimated/Worklets를 쓰므로 이점이 제한적 → 기본 비활성 유지.

## EAS

- `expo-updates`: `updates.maxUpdatesToKeep`.
- 관련 skill: `eas-app-stores`, `eas-update`, `eas-workflows`, `eas-observe`.

## 이 프로젝트의 도구 상태

- 빌드 방식: 로컬 `expo prebuild` + `expo run:ios|android` (EAS development build 미사용).
- `@expo/agent-cli`: 설치 없이 `npx @expo/agent-cli <command>`. **선택 사항.** `dev`/`smoke`는 앱이 빌드·설치된 뒤에 의미가 있다. 그 전에는 `status`/`doctor` 정도만 유용(`expo-doctor`, `tsc`, `lint`로 대체 가능). `agents:setup`은 `--no-agents-md --no-plugins`로 실행했다 (AGENTS.md/CLAUDE.md는 수동 관리).
- `expo-device-hub`: **제거함.** Xcode 27 Device Hub가 필요한데 개발 머신이 Xcode 16.4. Xcode 27로 올린 뒤 필요하면 `devDependencies`로 다시 추가.
- 로컬 v58 문서 사본: `~/.expo/agent-cli/docs/versions/v58.0.0` (저장소 밖).
- 미도입: Noxcturnal(Reanimated/Worklets 사용으로 효과 제한), expo-observe, expo-hinge, PostHog.
- prebuild 전 `app.json`에 `ios.bundleIdentifier`, `android.package` 지정 필요 (현재 미설정).
