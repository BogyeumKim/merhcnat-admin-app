# mms-mobile → Expo 이전 메모

레거시 앱(`mms-mobile`)을 읽기 전용 정적 분석한 결과다. 실행/런타임 검증은 하지 않았다. 비밀 값(.env, 키)과 개인정보는 열람/기록하지 않았다.

## 현재 스택 (레거시)

React Native 0.77.3 / React 18.3.1, 순수 RN(Expo 아님), 대부분 JS. React Navigation 7(native-stack + bottom-tabs), Redux Toolkit(auth/loading/todaySales), TanStack Query v5(캐시를 MMKV에 persist), axios(인터셉터로 `Authorization` + 기기 헤더 부착, 401/403/407/408/5xx 처리), MMKV, Keychain(사용자별 기기 ECDSA 키쌍), Firebase(analytics/crashlytics, push 메시징 없음), Sentry, freeRASP + jail-monkey(루팅/무결성 탐지). 다국어 없음(한글 하드코딩). 딥링크 없음.

## 네이티브 모듈 → Expo 대응

"번들" = `expo/bundledNativeModules.json`에 있음(`npx expo install`이 SDK 호환 버전을 해석). 번들에 없으면 호환 버전을 직접 확인해야 한다.

| 레거시 | 새 앱 | 상태 |
| --- | --- | --- |
| React Navigation | Expo Router | 이미 적용 |
| Redux Toolkit | TanStack Query(서버) + zustand(UI) | 결정됨. `loadingSlice`는 쿼리 상태/UI store로 대체 |
| `react-native-biometrics` | `expo-local-authentication` (번들) | 단순 인증 프롬프트면 대체 가능. **키 생성/서명에 쓰는 경우 대체 불가** → 확인 필요 |
| `react-native-keychain` (기기 ECDSA 키쌍) | **우선 미구현** | 용도와 영향은 `auth-jwt.md`. `expo-secure-store`는 저장만 가능하고 ECDSA 생성/서명은 못 한다 |
| `react-native-vision-camera` + cropper + worklets-core (카드 OCR) | 유지 (번들에 없음) | `expo-camera`는 프레임 프로세서가 없어 OCR 대체 불가 추정. config plugin 지원/버전 확인 필요 |
| `react-native-mmkv` 3.x | MMKV 유지 또는 `expo-sqlite/kv-store` | 사용자 결정 대기 (`storage-env-testing.md`) |
| `react-native-config` | `EXPO_PUBLIC_*` + app config | SDK 58은 `.env.development`/`.env.production`만 로드. dev/staging/prod 3환경 전략 필요 |
| `react-native-splash-screen` | `expo-splash-screen` (설치됨) | |
| `react-native-device-info` | `expo-device`, `expo-application` (번들) | |
| `react-native-permissions` | 각 모듈의 권한 API | 번들에 없음 |
| `react-native-fs` | `expo-file-system` (번들) | SDK 58에서 `File.write()`가 async로 변경 |
| `@react-native-camera-roll/camera-roll` | `expo-media-library` (번들) | |
| `react-native-view-shot` | `react-native-view-shot` (번들 6.1.1) | |
| `@react-native-clipboard/clipboard` | `expo-clipboard` (번들) | |
| `@react-native-community/netinfo` | 그대로 (번들 12.0.1) | |
| `react-native-fast-image` | `expo-image` (설치됨) | |
| `react-native-linear-gradient` | `expo-linear-gradient` (번들) | |
| `react-native-svg`, `pager-view`, `skia` | 그대로 (번들) | |
| `react-native-reanimated` 3.x | 4.7.1 (설치됨) | 메이저 업(3→4) 영향 확인 필요 |
| `@sentry/react-native` | 그대로 (번들 ~8.28.0) | Expo config plugin 사용 |
| Firebase analytics/crashlytics | `@react-native-firebase/*` + config plugin | 번들 여부 미확인 |
| `freerasp-react-native`, `jail-monkey` | **우선 미구현** (사용자 결정) | Expo 대체 없음. 이후 도입 시 prebuild + config plugin 필요 |
| `react-native-exit-app`(패치), `react-native-check-version` | 직접 구현/유지 | 강제 업데이트 시 스토어 이동 후 앱 종료 로직. Expo 대체 없음 |
| `react-native-quick-crypto`, `crypto-js` | `expo-crypto`(번들)로 일부 | 사용처(서명/암호화) 확인 필요 |
| `react-native-webview` | 번들 14.0.1 | 레거시는 HTML 렌더 보조용으로만 의존 |

## 로그인 흐름 (레거시)

- `v2/mobile/login` 호출. `res_code` `0000` 성공, `0011/0012/0014` OTP 필요(기기 키쌍 생성·서버 등록), `0010` 비밀번호 강제 변경, `8888` 강제 업데이트.
- 성공 시 응답 헤더의 `Authorization`이 토큰, 본문 전체가 `userData`로 저장된다. **토큰은 메모리(Redux)에만 있고 영속 저장하지 않아 자동 로그인이 없다 (새 앱도 같은 정책).** 응답마다 새 `Authorization` 헤더가 오면 토큰을 교체한다. refresh token 호출은 찾지 못했다.
- 401이면 로그아웃하고 "비활성 로그아웃" 문구를 로그인 화면에 보여준다.
- 사용자 타입은 `usr_type`(문자열/숫자 혼재). 계층 해석과 설계는 `docs/architecture/user-types.md`.

## 화면 목록 (레거시)

| 영역 | 화면 | 새 앱 방침(초안) |
| --- | --- | --- |
| 인증 | 로그인, OTP 인증, 비밀번호 변경 | 네이티브 |
| 탭 | 홈 대시보드, 거래내역(필터), 가맹점정보(타입 1은 상세, 그 외 목록), 전체메뉴 | 홈 미정 / 거래내역·가맹점 WebView |
| 가맹점 | 상세, 우대사업자 조회, 계층 필터 선택 | 계층 필터는 서버/웹 쪽 정리 후 결정 |
| 거래 | 거래 필터, 실패내역, 거래 상세 | WebView 후보 |
| 정산 | 입금 리포트(+합계), 부가세 리포트(+상세/안내) | WebView 후보 |
| 결제 | 수기결제, 카드 촬영 OCR, SMS 결제(+이력), 선결제(+결과/이력) | 입력 화면 네이티브, 이력은 WebView 후보 |
| 타입 0 전용 | `*InfoList`, `*ByGroupCoNo` 화면 8개 | 필요 여부 확인 |
| 공지/FAQ | 목록/상세(API가 주는 HTML) | 미정 |
| 기타 | 내비게이터 오류 화면 | 네이티브 오류 화면으로 계승 |

레거시에 사용되지 않는 듯한 중복 화면이 있다(`SmsPayScreen`, `MidScreen` 등).

## 이전 시 챙길 동작

- 강제 업데이트: 로그인 코드 `8888` + 스토어 버전 조회 → 스토어 이동 후 종료.
- 세션 타임아웃, 기기 헤더(deviceId, 버전, 네트워크 등) 전송, 응답 헤더 토큰 갱신.
- Sentry 래핑. (루팅/무결성 탐지와 기기 키쌍은 우선 미구현으로 결정)
- 환경 3종(dev/staging/prod).
- 권한: 카메라, 사진 보관함, (Android) 저장소, 알림.

## 미확인 / 사용자 확인 필요

1. 생체인증이 자격증명을 어디에 저장하는지, 자동 로그인을 새 앱에서 지원할지.
2. (결정됨: 키쌍 우선 미구현. 기기 바인딩은 `device-binding.md`의 식별자 + 서버 기준 설계)
3. (해결됨: refresh token 없음, 슬라이딩 만료. `auth-jwt.md`)
4. WebView 대상 백엔드/웹 도메인과 인증 방식 (`webview.md` 미정 항목).
5. 타입 2~5·9의 의미 정의 (코드 라벨과 사용자 정의가 다름, `user-types.md`).
6. iOS/Android 네이티브 설정(Firebase, 스킴, plist)은 분석하지 않았다.
