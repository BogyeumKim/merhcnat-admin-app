---
name: sdk58-check
description: SDK 58 호환성 점검. 의존성 정렬, 폐기/제거 API 검색, 타입체크와 린트를 순서대로 실행하고 결과를 보고한다. 업그레이드 후나 큰 변경 후에 사용.
disable-model-invocation: true
allowed-tools: Bash(npx expo-doctor*) Bash(npx tsc --noEmit*) Bash(npx expo lint*) Grep Read
---

# SDK 58 점검 절차

1. `npx expo-doctor` 실행 후 이슈 요약.
2. 아래 패턴을 `src/`에서 검색해 사용처를 나열한다 (`docs/expo-sdk-58/breaking-changes.md` 참고):
   - `InteractionManager`, `ImageBackground`, `react-native/Libraries`, `NativeMethods`
   - `withLayoutContext`, `AppMetrics`, `\.md5\b`, `syncLibSQL`, `useLibSQL`
   - `@expo/ui/swift-ui`, `@expo/ui/jetpack-compose` import가 플랫폼 확장자 파일 밖에 있는지
3. `npx tsc --noEmit`, `npx expo lint` 실행.
4. 결과를 "통과 / 실패(출력 포함) / 건너뜀" 으로 구분해 보고한다. 수정은 사용자 확인 후에만 진행한다.
