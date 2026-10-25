# 작업 검증 규칙

작업 완료를 선언하기 전에:

1. `npx tsc --noEmit`
2. `npx expo lint`, `npm run check:compiler`
3. 의존성을 건드렸다면 `npx expo-doctor`
4. UI 변경은 가능하면 실제로 실행해 확인한다 (`npx expo start`, 로컬 prebuild 빌드(`expo run:ios` / `run:android`)를 시뮬레이터나 기기에서). 확인하지 못했으면 확인하지 못했다고 보고한다.

실패한 검사는 출력과 함께 그대로 보고한다. 건너뛴 단계가 있으면 명시한다.

## 앱 실행 검증 (`@expo/agent-cli`, 실험)

- 실행 전 `npx @expo/agent-cli status`로 재빌드 필요 여부를 확인한다 (`expo go compatible`은 패키지 호환성일 뿐, 스토어 Expo Go의 SDK 58 지원을 뜻하지 않는다. 로컬 prebuild 빌드 필요) (JS만 변경이면 reload, 네이티브 변경이면 rebuild).
- 부팅 확인: `npx @expo/agent-cli smoke` (dev + 스크린샷 + 종료). 개발 서버 로그는 `dev:logs`, 중지는 `dev:stop`.
- `dev`는 터미널을 점유하므로 `dev --detach`를 사용한다. 계획만 보려면 `dev --plan --ios --json`.
- 서버/프로세스 상태는 `npx expo command:ps`, `command:events`.
- 실험 기능이라 명령이 바뀔 수 있다. 실패하면 출력 그대로 보고하고 `npx expo start`로 대체한다.
