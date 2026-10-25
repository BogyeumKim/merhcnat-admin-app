# 로그인 / 추가 인증 UI (앱 구현)

서버가 없어서 **개발용 mock**(`EXPO_PUBLIC_API_MOCK=1`, 개발 빌드에서만)으로 전체 흐름이 돈다. 계약은 `docs/backend-contract/`. 기기에서 실행해 본 것은 아직 없다.

## 화면과 파일

| 라우트 | 화면 | 위치 |
| --- | --- | --- |
| `/sign-in` | 로그인 폼 | `features/auth/screens/sign-in-screen.tsx`, `components/login-form.tsx` |
| `/verify` | 2단계 인증(form sheet, 스와이프 닫기 꺼짐): 기기 안내 → 인증 수단 선택 → 코드 입력 | `features/auth/screens/verify-screen.tsx`, `components/{device-notice,method-choice,code-entry,resend-button}.tsx` |
| `/maintenance` | 점검 안내(modal) (기간은 구조화 필드를 앱 언어로 포맷) | `features/maintenance/` |
| (오류) | 렌더 오류 폴백 | `app/_layout.tsx`의 `ErrorBoundary` → `shared/ui/error-screen.tsx` |

레이아웃/키보드/글꼴은 `shared/ui/branded-layout.tsx`, `branded-form-screen.tsx`, `native-*.tsx` 한 곳에서 정한다 (`responsive-ui.md`).

## 흐름

1. 로그인: `POST /v1/auth/login` → `AUTHENTICATED`(토큰은 응답 헤더 `Access-Token`, 메모리 보관) 또는 `CHALLENGE_REQUIRED`.
2. `CHALLENGE_REQUIRED` → `/verify`:
   - `deviceState`가 `NONE`/`CHANGED`면 먼저 기기 안내 + 계속/취소.
   - TOTP는 바로 코드 입력. 문자/메일/카카오는 사용자가 수단을 고른 뒤 `send` → 코드 입력(재전송 쿨다운 30초).
   - `verify`에 `confirmDevice`(= 기기 상태가 `MATCH`가 아닐 때 true) 전송.
3. 성공 시 `completeSignIn(userType)` → 세션 store 갱신 → `Stack.Protected`가 `(tabs)`로 전환.
4. 오류는 `ApiError.code`로 분류해 보여준다 (`feedback-ux.md`): 자격 증명 실패/계정 불가는 폼 상단 지속 알림(`FormAlert`), 코드 오류는 필드 아래, 네트워크/타임아웃/429는 토스트(같은 id는 갱신), 점검은 `/maintenance`. 모르는 코드는 `UNKNOWN`(토스트). 입력 검증은 react-hook-form + zod, 메시지는 검증 코드를 번역.
5. 비밀번호는 로그인 성공 또는 `INVALID_CREDENTIALS` 때 입력창에서 지운다. 로그인 mutation은 `gcTime: 0`이고 호출이 끝나면 `reset()`해서 변수(비밀번호)가 메모리에 남지 않는다. 같은 요청의 중복 제출은 `inFlight` 가드가 막고, 인증 코드는 6번째 숫자를 입력하면 자동 제출된다(iOS 숫자 패드에 Return 키가 없음).
6. 로그아웃/401: `signOutLocally()` — 메모리 토큰·세션·진행 중 챌린지를 지우고 쿼리 캐시를 비운다.

## 개발용 mock 시나리오 (`auth-api.mock.ts`, 더미 값만)

아이디를 입력한다. 비밀번호는 `wrong` 외에는 아무거나.

| 아이디 | 결과 |
| --- | --- |
| `1234` (비밀번호 `1234`) | 바로 로그인해 탭 화면으로 이동하는 개발용 지름길. 다른 비밀번호는 `INVALID_CREDENTIALS` |
| `merchant` | OTP 타입 1 + 등록된 기기 → 코드 없이 로그인 (타입 `Mid`) |
| `newdevice` | 기기 없음(`NONE`) → 기기 안내 → 수단 선택(문자/메일/카카오) → 코드 |
| `changed` | 다른 기기 등록(`CHANGED`) → 안내 → 수단 선택 → 코드 |
| `totp` | TOTP, 등록된 기기 → 바로 코드 입력 |
| `totpnew` | TOTP, 기기 없음 → 안내 → 코드 |
| `blocked` | 403 `ACCOUNT_TYPE_NOT_ALLOWED` |
| `maint` | 503 `MAINTENANCE` (기간 포함) → 점검 화면 |

코드 `000000` = 성공, `999999` = 만료, 그 외 = 오류(5회 오류 시 `OTP_LOCKED`).
mock은 릴리스 번들에서 제거된다 (`__DEV__` 안 `require`; 릴리스 번들에서 `mock-access-token` 문자열 0건으로 확인).

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
