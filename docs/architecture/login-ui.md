# 로그인 / 추가 인증 UI (앱 구현)

서버가 없어서 **개발용 mock**(`EXPO_PUBLIC_API_MOCK=1`, 개발 빌드에서만)으로 전체 흐름이 돈다. 계약은 `docs/backend-contract/`. 기기에서 실행해 본 것은 아직 없다.

## 화면과 파일

| 라우트 | 화면 | 위치 |
| --- | --- | --- |
| `/sign-in` | 로그인 폼 | `features/auth/screens/sign-in-screen.tsx`, `components/login-form.tsx` |
| `/verify` | 2단계 인증(form sheet, 스와이프 닫기 꺼짐): 기기 안내 → 인증 수단 선택 → 코드 입력 | `features/auth/screens/verify-screen.tsx`, `components/{device-notice,method-choice,code-entry,resend-button}.tsx` |
| `/maintenance` | 점검 안내(modal) (기간은 구조화 필드를 앱 언어로 포맷) | `features/maintenance/` |
| (오류) | 렌더 오류 폴백 | `app/_layout.tsx`의 `ErrorBoundary` → `shared/ui/error-screen.tsx` |

디자인(방향 A): 가운데 정렬 한 열. 워드마크만(심벌 없음) + 한 줄 문구, 그 아래 위쪽 라벨 + 밑줄 입력창, 비밀번호 눈 아이콘, **로그인 버튼은 입력 바로 아래**(입력 전 회색 비활성), 화면 맨 아래에 앱 버전 한 줄. 참고: KREAM·아이엠그라운드·여기어때 같은 로그인 화면의 공통점(워드마크 중심, 단일 주 버튼). 이 앱은 아이디/비밀번호만 지원하므로 소셜 로그인·가입·찾기는 없다. 밑줄은 대비 3:1 이상(`fieldBorder`), 포커스/오류는 2pt로 색에만 의존하지 않는다. 로고는 `korpay-logo.svg`(Poppins SemiBold, SIL OFL 1.1, 윤곽선 변환 + K 전체 브랜드 빨강). 다른 로고로 바꾸려면 파일과 `brand-logo.tsx`의 `LOGO_ASPECT_RATIO`만 바꾼다.

레이아웃/키보드/글꼴은 `shared/ui/branded-layout.tsx`, `branded-form-screen.tsx`, `native-*.tsx` 한 곳에서 정한다 (`responsive-ui.md`).

## 흐름

계약과 오류 표: `docs/backend-contract/app-migration-server-login.md`.

1. 로그인: `POST /api/auth/login`(ID, 비밀번호, 기기 정보). HTTP 200 `SUCCESS`(등록된 기기 + 문자/카카오 계정)이면 `Access-Token` 헤더와 함께 바로 로그인 완료, HTTP 202 `MFA_REQUIRED`면(로그인이 아님) `challengeToken`을 메모리에 두고 `/verify` 시트로 간다. 비밀번호는 여기서 버린다.
2. `/verify`(form sheet; 일반 시트처럼 아래로 내리거나 취소로 닫고, 닫히면 진행 중이던 챌린지가 함께 지워진다):
   - `deviceState`가 `NONE`/`CHANGED`면 먼저 새 기기 안내 + 계속/취소.
   - TOTP는 바로 코드 입력. 카카오/문자는 사용자가 채널을 고른 뒤 `otp/send` → 코드 입력 (서버가 준 `resendAfterSeconds`만큼 재전송 대기, `expiresInSeconds`로 남은 시간 표시).
   - 코드는 6번째 숫자에서 자동 제출 (iOS 숫자 패드에 Return 없음, SMS 자동 입력 대응). `otp/verify` 성공 시 로그인 완료, 서버가 기기를 등록한다.
3. 성공 시 `completeSignIn(userType)` → 세션 store 갱신 → `Stack.Protected`가 `(tabs)`로 전환. 로그인이 끝날 때마다 알림 권한을 요청하고 `PUT /api/devices/me`로 서버에 알린다(`device-push.ts`).
4. 오류는 `ApiError.code`로 분류해 보여준다 (`feedback-ux.md`): 자격 증명 실패는 폼 위 지속 알림(`FormAlert`: 아이콘 + 문구), 코드 오류는 필드 아래(틀린 횟수 안내), 잠금(`ACCOUNT_LOCKED`, 비밀번호+코드 오류 합쳐 5회, 영구)은 `/account-locked` 안내 화면(재시도 없음), 챌린지 토큰 만료는 토스트 + 로그인 화면으로, 네트워크/타임아웃은 토스트, 점검은 `/maintenance`.
5. 비밀번호는 로그인 호출이 끝나면 입력창에서 지운다(성공/`INVALID_CREDENTIALS`). 로그인 mutation은 `gcTime: 0`이고 끝나면 `reset()`해서 변수(비밀번호)가 메모리에 남지 않는다. 같은 요청의 중복 제출은 `inFlight` 가드가 막는다.
6. 로그아웃/401: `signOutLocally()` — 메모리 토큰·세션·진행 중 챌린지를 지우고 쿼리 캐시를 비운다.

## 개발용 mock 시나리오 (`auth-api.mock.ts`, 더미 값만)

아이디를 입력한다. 비밀번호는 `wrong` 외에는 아무거나. 자세한 시나리오(`1234`, `merchant`, `kakao`, `changed`, `totp`, `totpnew`, `nophone`, `lockotp`, `locked`, `blocked`, `maint`)는 `auth-api.mock.ts` 맨 위 주석. 코드 `000000` = 성공, `999999` = 만료, 그 외 = 오류(남은 횟수 안내, 5회 연속이면 일시 잠금).
mock은 릴리스 번들에서 제거된다 (`__DEV__` 안 `require`; 릴리스 번들에서 `mock-access-token` 문자열 0건으로 확인).

## 서버 연동

개발 기본값은 로컬 서버(`http://localhost:8080`, `EXPO_PUBLIC_API_MOCK=0`)다. 요청/응답 형식과 서버가 맞춰야 할 부분(`Access-Token` 헤더, `userType`)은 `docs/backend-contract/app-migration-server-login.md`. 서버 없이 화면만 보려면 `EXPO_PUBLIC_API_MOCK=1`로 아래 mock 시나리오를 쓴다.

## 환경 변수

`src/shared/config/env.ts`가 시작 시 한 번 검증한다 (누락 시 앱이 바로 오류). `.env.development`는 자리표시 호스트(`api.example.invalid`)와 mock 켜짐. 운영 빌드에는 실제 `EXPO_PUBLIC_API_BASE_URL`이 필요하다 (`.env.example` 참고). 이 값들은 공개되므로 비밀 값 금지.

## 접근성 현황과 한계

- 입력창에는 보이는 라벨과 필드별 오류 자리(`LabeledField`)가 있다. 화면 제목은 iOS에서 `isHeader` trait. 오류 메시지는 `useAnnounce`로 VoiceOver/TalkBack에 낭독한다. Android 제목 heading semantics는 미구현.
- 색 대비는 계산해 정했다: 라이트 브랜드 5.40, 다크 브랜드 4.51~4.65(흰 글자 버튼과 텍스트 버튼 모두 통과하는 좁은 구간), 필드 테두리 3:1 이상. 근거와 수치는 `shared/theme/colors.ts` 주석과 `docs/reviews/skill-compliance.md`.
- iOS 텍스트 버튼은 44pt 터치 영역을 위해 라벨 안쪽에 패딩을 둔다 (`native-button.ios.tsx`).

## 미구현 / 다음

- 사용자 타입별 capability 맵과 타입별 탭 구성 (`user-types.md`).
- 로그아웃 UI, 세션 만료 문구 표시, 앱 백그라운드 후 경과 시간으로 선로그아웃 (`auth-jwt.md`).
- 운영 서버 연동 (계약 확정 후), 푸시 토큰 전송.
