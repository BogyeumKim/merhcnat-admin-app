# 저장소 / 환경변수 / 테스트 조사 기록

## 1. 저장소: MMKV vs SQLite

둘은 대체 관계가 아니라 **용도가 다르다.** 용도별로 나눠 쓰는 구성이 일반적이다.

| 용도 | 선택 | 근거 |
| --- | --- | --- |
| 토큰/비밀 | `expo-secure-store` | Expo 문서: "small values such as tokens, keys, and other secrets" |
| 작은 설정값 | `expo-sqlite/kv-store` | AsyncStorage와 같은 API + **동기 API**(`getItemSync`), 별도 의존성 없음 (Expo 문서) |
| 구조화/대량 데이터 | `expo-sqlite` | Expo 문서: 쿼리 가능한 구조화 데이터 |
| (대안) 빠른 동기 KV | `react-native-mmkv` v4 | 서드파티, 네이티브 모듈이라 Expo Go 불가, `react-native-nitro-modules` 필요 (블로그/가이드 근거, 공식 문서 언급 없음) |

### 왜 kv-store를 골랐나 / MMKV "30배" 주장

- **"30배"는 AsyncStorage 대비 수치다.** MMKV 공식 README 기준이며 SQLite/kv-store는 비교 대상에 없다. `kv-store`와 MMKV를 직접 비교한 벤치마크는 검색에서 찾지 못했고, 이 프로젝트에서 측정하지도 않았다. 즉 kv-store를 고른 근거는 **성능 측정이 아니라** 프로젝트 원칙(Expo 모듈 우선)이다.
- `kv-store`는 AsyncStorage와 달리 **동기 API**(`getItemSync`)가 있어서 "비동기라 느리다"는 비교는 그대로 적용되지 않는다.
- **zustand 궁합:** `persist`는 `getItem/setItem/removeItem`을 가진 어떤 저장소든 `createJSONStorage`로 연결할 수 있다(동기/비동기 모두). MMKV도 kv-store도 얇은 어댑터가 필요하다. "MMKV가 훨씬 궁합이 좋다"는 말의 근거는 블로그 수준이며, kv-store가 불가능하다는 근거는 없다.
- **MMKV 쪽 현실적 이점:** 레거시 앱(mms-mobile)이 이미 MMKV를 쓰고 있다(팀 경험/마이그레이션 연속성). 커뮤니티 사용 사례가 많다.
- **MMKV 쪽 비용:** `react-native-mmkv`와 `react-native-nitro-modules`는 Expo 번들 호환 목록에 없어 `expo install`이 SDK 호환 버전을 보장하지 않는다. 네이티브 모듈이라 Expo Go 불가(이 프로젝트는 로컬 prebuild라 문제없음).
- 현재 저장하는 값은 언어 설정 하나라 어느 쪽이든 체감 차이가 없다. 저장소는 `shared/lib/storage` 뒤에 숨겨 두었으므로 MMKV로 바꾸는 비용은 파일 3개 수준이다.
- 결론: 성능과 zustand persist를 우선한다면 MMKV 전환도 합리적이지만, **사용자가 현재는 바꾸지 않기로 결정했다** (`kv-store` 유지). 병목이 확인되거나 persist 대상이 커지면 다시 검토한다.

**Query persister는 켜지 않았다.** 결제/정산 데이터를 평문 디스크 캐시에 남기게 되고, 아직 백엔드/쿼리도 없다.

한계: kv-store는 암호화되지 않는다. kv-store 자체의 SDK 58 변경 사항은 문서에서 확인하지 못했다.

## 2. 환경변수 검증

- 필수는 아니지만 **권장**한다. 이유가 Expo 동작에 있다: `EXPO_PUBLIC_*`는 빌드 시 정적으로 치환되고, 값이 없거나 `process.env[name]`/구조분해로 접근하면 에러 없이 `undefined`가 된다 (Expo 문서).
- Expo 문서에는 검증 권장 문구가 없다. "실무에서 흔한가"는 수치로 확인하지 못했고, 팀 프로젝트에서 `zod`로 시작 시점에 한 번 파싱하는 방식이 널리 쓰인다는 일반론 수준이다.
- 지금은 환경변수가 하나도 없어 코드를 만들지 않았다. 첫 변수를 추가할 때 `core/config/env.ts`를 만든다 (`.claude/rules/storage-env.md`).
- 보안: `EXPO_PUBLIC_`에는 비밀 값을 넣지 않는다.

## 3. Jest

- Expo 문서가 Jest를 기본 프레임워크로 안내한다: `jest-expo` 프리셋 + `@testing-library/react-native`. **SDK 58의 `jest-expo`는 Jest 30이 필요**하다.
- 같은 문서가 "UI 테스트는 스냅샷 단위 테스트보다 E2E를 권장"하며 E2E 도구로 **Maestro**(EAS Workflows)를 안내한다.
- "실무에서 많이 쓰나"는 수치로 확인하지 못했다. 공식 기본값이라는 사실까지만 확인했다.
- 이 프로젝트는 UI를 네이티브 `@expo/ui`로 그려서 RNTL로 검증할 수 있는 범위가 좁다. **미설치.** 순수 로직/훅(캐시 갱신, 변환 함수)이 생기면 `jest-expo`를 도입하고, 화면 검증은 Maestro를 검토한다.

## 4. 참고한 자료

- https://docs.expo.dev/develop/user-interface/store-data/
- https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/
- https://docs.expo.dev/guides/environment-variables/
- https://docs.expo.dev/develop/unit-testing/
- https://docs.expo.dev/router/advanced/authentication/
- MMKV 관련은 블로그/가이드 검색 결과(공식 문서 아님)
