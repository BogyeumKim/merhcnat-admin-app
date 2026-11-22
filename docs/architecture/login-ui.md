# 로그인 / 추가 인증 UI (앱 구현)

서버가 없어서 **개발용 mock**(`EXPO_PUBLIC_API_MOCK=1`, 개발 빌드에서만)으로 전체 흐름이 돈다. 계약은 `docs/backend-contract/`. 기기에서 실행해 본 것은 아직 없다.

## 화면과 파일

| 라우트 | 화면 | 위치 |
| --- | --- | --- |
| `/sign-in` | 로그인 폼 | `features/auth/screens/sign-in-screen.tsx`, `components/login-form.tsx` |
| `/verify` | 2단계 인증(form sheet, 아래로 끌어 닫기 + 그래버): 기기 안내 → 인증 수단 선택 → 코드 입력 | `features/auth/screens/verify-screen.tsx`, `components/{device-notice,method-choice,code-entry,resend-button}.tsx` |
| `/maintenance` | 점검 안내(modal) (기간은 구조화 필드를 앱 언어로 포맷) | `features/maintenance/` |
| (오류) | 렌더 오류 폴백 | `app/_layout.tsx`의 `ErrorBoundary`(스택은 `core/navigation/root-stack.tsx`) → `shared/ui/error-screen.tsx` |

디자인(방향 A): 가운데 정렬 한 열. 워드마크만(심벌 없음) + 한 줄 문구, 그 아래 위쪽 라벨 + 밑줄 입력창, 비밀번호 눈 아이콘, **로그인 버튼은 입력 바로 아래**(입력 전 회색 비활성), 화면 맨 아래에 앱 버전 한 줄. 참고: KREAM·아이엠그라운드·여기어때 같은 로그인 화면의 공통점(워드마크 중심, 단일 주 버튼). 이 앱은 아이디/비밀번호만 지원하므로 소셜 로그인·가입·찾기는 없다. 밑줄은 대비 3:1 이상(`fieldBorder`), 포커스/오류는 2pt로 색에만 의존하지 않는다. 로고는 `korpay-logo.svg`(Poppins SemiBold, SIL OFL 1.1, 윤곽선 변환 + K 전체 브랜드 빨강). 다른 로고로 바꾸려면 파일과 `brand-logo.tsx`의 `LOGO_ASPECT_RATIO`만 바꾼다.

레이아웃/키보드/글꼴은 `shared/ui/branded-layout.tsx`, `branded-form-screen.tsx`, `native-*.tsx` 한 곳에서 정한다 (`responsive-ui.md`).

## 흐름

계약과 오류 표: `docs/backend-contract/app-migration-server-login.md`.

1. 로그인: `POST /api/auth/login`(ID, 비밀번호, 기기 정보). HTTP 200 `SUCCESS`(등록된 기기 + 문자/카카오 계정)이면 `Access-Token` 헤더와 함께 바로 로그인 완료, 200 `MFA_REQUIRED`면(로그인이 아님, code로 판별) `challengeToken`을 메모리에 두고 `/verify` 시트로 간다. 비밀번호는 여기서 버린다.
2. `/verify`(form sheet; 일반 시트처럼 아래로 내리거나 취소로 닫고, 닫히면 진행 중이던 챌린지가 함께 지워진다):
   - `deviceState`가 `NONE`/`CHANGED`면 먼저 새 기기 안내 + 계속/취소.
   - TOTP는 바로 코드 입력. 카카오/문자는 사용자가 채널을 고른 뒤 `otp/send` → 코드 입력 (서버가 준 `resendAfterSeconds`만큼 "N초 후 다시 받기" UI 타이머(서버 강제 아님, 받을 곳 다시 고르기에서는 대기 없이 바로 발송), `expiresInSeconds`로 남은 시간 표시). 수단 카드(같은 수단 포함)를 누를 때마다 항상 새 코드를 보낸다: 코드 입력에서 뒤로 가면 입력 중이던 코드는 버리고, "보낸 인증번호 입력하기"처럼 이전 코드를 재사용하는 카드 상태는 없다. 챌린지당 5회, 6번째 429 `OTP_SEND_LIMIT_EXCEEDED`는 토스트 + 시트 닫기. "최근 사용" 배지는 유지.
   - 닫기는 진행 막대 줄 끝의 X 아이콘 버튼(공용 `IconButton` + `TOP_BAR_GLYPH`: iOS `xmark`, Android Material `close`, 44pt, 라벨 `auth.verify.close`) 하나다(수단 선택·이메일 전용·코드 입력, "로그인이 안 되나요?" 시트 머리). 하단 "닫기" 버튼은 주 동작 옆 보조 선택인 기기 변경 안내(`DeviceNotice`)와 연락처 없음 안내에만 남긴다.
   - 코드는 6번째 숫자에서 자동 제출 (iOS 숫자 패드에 Return 없음, SMS 자동 입력 대응). `otp/verify` 성공 시 로그인 완료, 서버가 기기를 등록한다.
3. 성공 시 `completeSignIn(userType)` → 세션 store 갱신 → `Stack.Protected`가 `(tabs)`로 전환. 로그인이 끝날 때마다 알림 권한을 요청하고 `PUT /api/devices/me`로 서버에 알린다(`device-push.ts`).
4. 오류는 `ApiError.code`로 분류해 보여준다 (`feedback-ux.md`): 자격 증명 실패는 폼 위 지속 알림(`FormAlert`: 아이콘 + 문구), 코드 오류는 필드 아래(틀린 횟수 안내), 잠금(`ACCOUNT_LOCKED`, 비밀번호+코드 오류 합쳐 5회, 영구)은 `/account-locked` 안내 화면(재시도 없음), 챌린지 토큰 만료는 토스트 + 로그인 화면으로, 네트워크/타임아웃은 토스트, 점검은 `/maintenance`.
5. 비밀번호는 `INVALID_CREDENTIALS`이면 지우고, 인증 단계로 갈 때는 남긴다(성공 후 OS 비밀번호 관리자가 저장을 제안할 수 있게). `/verify`는 `openSheet()`로 띄워 그 전에 입력란 블러(`onBlur` 완료, Android는 `Keyboard.dismiss()`도)를 기다린다(시트가 닫혀도 포커스·키보드가 비밀번호 칸으로 돌아오지 않음). **정책: 로그인 화면을 벗어나 진행한 인증 흐름이 성공 없이 끝나 로그인 화면으로 돌아오면 아이디·비밀번호를 모두 초기화한다.** 대상은 2단계 인증(X·스와이프·뒤로가기, 발송 한도, 챌린지 만료, 잠김 등 이유 무관)과 로그인 전 임시비밀번호·만료 비밀번호 변경(취소, 토큰 만료 등 로그인 없이 화면이 제거됨). `auth-flow-store`가 `succeed()` 표시 없이 challenge가 지워지거나 비밀번호 변경 화면이 로그인 없이 제거되면(`abandon()`) `abandonedCount`를 올리고, `SignInScreen`이 이를 `LoginForm`의 `key`로 써서 폼을 새로 마운트한다. 네이티브 ref를 부르지 않으므로(Android `clear()`는 화면이 시트에 가려져 Compose가 구성되지 않았으면 거부된다) 언제 불려도 안전하고, react-hook-form 값·오류·touched와 지우기 버튼 상태도 함께 비며 자동 포커스는 없다. 초기화하지 않는 경우: "로그인이 안 되나요?" 시트(로그인 화면 안의 도움말, 값 유지), 비밀번호 오류(`INVALID_CREDENTIALS`: 화면이 보이는 상태라 `passwordResetKey`로 비밀번호만 `clear()`, 아이디 유지), 성공(OS 비밀번호 저장 제안을 위해 아무것도 바꾸지 않음). 로그아웃·세션 만료 후에는 `Stack.Protected`가 로그인 화면을 새로 마운트하므로 처음부터 빈 칸이다. 로그인 mutation은 `gcTime: 0`이고 끝나면 `reset()`해서 변수(비밀번호)가 메모리에 남지 않는다. 같은 요청의 중복 제출은 `inFlight` 가드가 막는다.
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
- 색 대비는 계산해 정했다: 라이트 브랜드 5.40, 다크 브랜드 4.51~4.65(흰 글자 버튼과 텍스트 버튼 모두 통과하는 좁은 구간), 필드 테두리 3:1 이상. 근거와 수치는 `shared/theme/colors.ts` 주석.
- iOS 텍스트 버튼은 44pt 터치 영역을 위해 라벨 안쪽에 패딩을 둔다 (`native-button.ios.tsx`).

## 미구현 / 다음

- 사용자 타입별 capability 맵과 타입별 탭 구성 (`user-types.md`).
- 로그아웃 UI, 세션 만료 문구 표시, 앱 백그라운드 후 경과 시간으로 선로그아웃 (`auth-jwt.md`).
- 운영 서버 연동 (계약 확정 후), 푸시 토큰 전송.
