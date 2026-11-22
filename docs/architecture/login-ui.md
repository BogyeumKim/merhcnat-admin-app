# 로그인 / 추가 인증 UI (앱 구현)

서버가 없어서 **개발용 mock**(`EXPO_PUBLIC_API_MOCK=1`, 개발 빌드에서만)으로 전체 흐름이 돈다. 계약은 `docs/backend-contract/`. 기기에서 실행해 본 것은 아직 없다.

## 화면과 파일

| 라우트 | 화면 | 위치 |
| --- | --- | --- |
| `/sign-in` | 로그인 폼 | `features/auth/screens/sign-in-screen.tsx`, `components/login-form.tsx` |
| `/verify` | 2단계 인증(form sheet, 아래로 끌어 닫기 + 그래버): 기기 안내 → 인증 수단 선택 → 코드 입력 | `features/auth/screens/verify-screen.tsx`, `components/{device-notice,method-choice,code-entry,resend-button}.tsx` |
| `/maintenance` | 점검 안내(modal, 디자인 1-10): 제목·설명은 i18n, 카드에는 시작·종료 예정 시각(`startedAt`/`endsAt`를 앱 언어로 포맷, 없으면 행 숨김)만. 남은 시간·영향 범위·서버 문구는 표시하지 않음. [로그인 화면으로](iOS·Android 공통, 기본 채움 버튼)는 기기 시각과 무관하게 항상 로그인으로(교체 또는 로그인까지 닫기, 뒤로가기 아님). 점검이 계속되면 다음 요청이 503 `MAINTENANCE`로 다시 이 화면을 띄움 | `features/maintenance/` |
| (오류) | 렌더 오류 폴백 | `app/_layout.tsx`의 `ErrorBoundary`(스택은 `core/navigation/root-stack.tsx`) → `shared/ui/error-screen.tsx` |

디자인(방향 A): 가운데 정렬 한 열. 워드마크만(심벌 없음) + 한 줄 문구, 그 아래 위쪽 라벨 + 밑줄 입력창, 비밀번호 눈 아이콘, **로그인 버튼은 항상 하단 고정**(`footer`, 키보드 위. 입력 전 회색 비활성, 손쉬운 사용 글꼴에서는 스크롤 맨 끝), **"로그인이 안 되나요?" 링크는 비밀번호 칸(과 그 아래 오류 문구) 바로 아래 오른쪽**(Baymard: 도움말은 비밀번호 칸 근처 오른쪽/아래). 앱 버전 줄은 없다(설정 화면에서 본다). 폰·펼친 폴더블·태블릿·창 모드 모두 같은 배치이고 좌우 분할은 없다(넓은 창은 `CONTENT_MAX_WIDTH`로 가운데). 참고: KREAM·아이엠그라운드·여기어때 같은 로그인 화면의 공통점(워드마크 중심, 단일 주 버튼). 이 앱은 아이디/비밀번호만 지원하므로 소셜 로그인·가입·찾기는 없다. 밑줄은 대비 3:1 이상(`fieldBorder`), 포커스는 2pt. 오류는 테두리 색이 아니라 칸 아래 문구로 알린다. 화면에 들어와도 아이디 칸에 자동 포커스하지 않는다(키보드는 사용자가 입력란을 누를 때만 올라온다). 로고는 `korpay-logo.svg`(Poppins SemiBold, SIL OFL 1.1, 윤곽선 변환 + K 전체 브랜드 빨강). 다른 로고로 바꾸려면 파일과 `brand-logo.tsx`의 `LOGO_ASPECT_RATIO`만 바꾼다.

레이아웃/키보드/글꼴은 `shared/ui/branded-form-screen.tsx`(배경 + safe area + `NativeFormScroll`, 첫 요소 `BrandHero`), `brand-hero.tsx`, `native-*.tsx`에서 정한다 (`responsive-ui.md`). 로그인 폼(`login-form.tsx`)은 창 크기로 분기하지 않는다.

## 흐름

계약과 오류 표: `docs/backend-contract/app-migration-server-login.md`.

1. 로그인: `POST /api/auth/login`(ID, 비밀번호, 기기 정보). HTTP 200 `SUCCESS`(등록된 기기 + 문자/카카오 계정)이면 `data.accessToken`(전환기에는 `Access-Token` 헤더 폴백)과 함께 바로 로그인 완료, 200 `MFA_REQUIRED`면(로그인이 아님, code로 판별) `challengeToken`을 메모리에 두고 `/verify` 시트로 간다. 비밀번호는 여기서 버린다.
2. `/verify`(form sheet; 일반 시트처럼 아래로 내리거나 취소로 닫고, 닫히면 진행 중이던 챌린지가 함께 지워진다):
   - `deviceState`가 `NONE`/`CHANGED`면 먼저 새 기기 안내 + 계속/취소.
   - TOTP는 바로 코드 입력. 카카오/문자는 사용자가 채널을 고른 뒤 `otp/send` → 코드 입력 (서버가 준 `resendAfterSeconds`만큼 "N초 후 다시 받기" UI 타이머(서버 강제 아님, 받을 곳 다시 고르기에서는 대기 없이 바로 발송), `expiresInSeconds`로 남은 시간 표시). 수단 카드(같은 수단 포함)를 누를 때마다 항상 새 코드를 보낸다: 코드 입력에서 뒤로 가면 입력 중이던 코드는 버리고, "보낸 인증번호 입력하기"처럼 이전 코드를 재사용하는 카드 상태는 없다. 챌린지당 5회, 6번째 429 `OTP_SEND_LIMIT_EXCEEDED`는 토스트 + 시트 닫기. "최근 사용" 배지는 유지.
   - 닫기는 진행 막대 줄 끝의 X 아이콘 버튼(공용 `IconButton` + `TOP_BAR_GLYPH`: iOS `xmark`, Android Material `close`, 44pt, 라벨 `auth.verify.close`) 하나다(수단 선택·이메일 전용·코드 입력, "로그인이 안 되나요?" 시트 머리). 하단 "닫기" 버튼은 주 동작 옆 보조 선택인 기기 변경 안내(`DeviceNotice`)와 연락처 없음 안내에만 남긴다.
   - 코드는 6번째 숫자에서 자동 제출 (iOS 숫자 패드에 Return 없음, SMS 자동 입력 대응). `otp/verify` 성공 시 로그인 완료, 서버가 기기를 등록한다.
   - 코드 단계 상태(`code-entry.tsx`): 발송 중은 카드 스피너 또는 재전송 자리의 "전송 중…", 확인 중은 6칸 잠김 + "확인하고 있어요", 틀림은 6칸을 비우고(`attempt` 키로 다시 마운트, 포커스·커서는 코드로 옮기지 않음: 자동 포커스는 코드 단계 진입·새 코드 때만) 빨간 칸 + 칸 아래 오류 문구, 다시 받기는 틀려도 앞당기지 않고 서버 `resendAfterSeconds` 타이머를 그대로 따른다, 시간 초과(0초 또는 `OTP_EXPIRED`)는 칸 비활성 + 문구 + [인증번호 다시 받기] 버튼 + "다른 방법으로 받기". TOTP는 남은 시간·다시 받기 없이 전용 문구와 "인증 앱을 쓸 수 없나요?"(도움말 OTP 항목).
   - 비밀번호·코드 오류는 같은 실패 횟수로 합산되고, 5번째 오류는 400 `ACCOUNT_LOCKED`(`userIdMasked`, `lockedAt`)다. 이후 해제 전까지 `otp/send`·`otp/verify`·로그인 모두 `ACCOUNT_LOCKED`. 2단계 인증 중(`otp/send`·`otp/verify`) 받은 잠김·정지는 **인증 시트를 닫고** 로그인 화면 위에 안내 화면을 띄운다(`route-blocking-error.ts`: `dismissAll()` → `push`, 같은 틱, 스택 [로그인, 안내]). 시트 안 잠김 안내는 없다. 시트 제거 시 `removed` 정리로 challenge·토큰이 폐기되고, 로그인 화면은 마운트된 채라 아이디·비밀번호가 남는다. 로그인 요청 자체의 잠김도 같은 안내 화면이다(로그인 화면뿐이라 `push`만). 안내 화면의 [로그인 화면으로]는 안내를 닫고 로그인 화면으로 돌아온다(값 유지). 기기 변경(`CHANGED`) 안내 시트는 `registeredUserIdMasked`(가려진 기존 기기 아이디)를 보여준다. 연락처가 없으면 연락처 없음 시트(`no-contact-notice.tsx`).
   - X + 그래버는 유지한다(사용자 결정: X는 스와이프의 한 번 탭 대안).
3. 성공 시 `completeSignIn(userType)` → 세션 store 갱신 → `Stack.Protected`가 `(tabs)`로 전환. 로그인이 끝날 때마다 알림 권한을 요청하고 `PUT /api/devices/me`로 서버에 알린다(`device-push.ts`).
4. 오류는 `ApiError.code`로 분류해 보여준다 (`feedback-ux.md`). **남은 시도 횟수는 어디에도 표시하지 않는다**(서버가 보내도 무시).
   - 자격 증명 실패: 아이디·비밀번호 칸에 빨간 테두리 없이 비밀번호 칸 아래 문구, 비밀번호만 비움.
   - 차단 화면(잠김 `ACCOUNT_LOCKED`·정지·점검·필수 업데이트·보안 위험 기기·세션 종료)은 모두 `BlockingScreenLayout`이고(모든 창에서 한 컬럼: 로고·상태 헤더·상세가 스크롤 안, 버튼은 아래 고정, 폴더블 좌우 분할 없음. 로고 숨김·위 여백은 로그인 히어로와 같은 규칙) Android 뒤로가기는 앱 종료(`useBlockBackButton(true, 'exit')`). 고객센터 연락은 `SupportContactButtons`(`openSupportChat`/`openSupportPhone`).
   - 네트워크 오류·타임아웃(요청 10초, `shared/api/client.ts`)은 입력값을 유지하고 일반 오류 토스트(`showErrorToast`, id `error:<code>`, 자동으로 사라짐, `errors.NETWORK_ERROR`/`errors.TIMEOUT` 문구)를 띄운다. 재시도 버튼은 없고 사용자가 [로그인]을 다시 누른다. 챌린지 토큰 만료·발송 한도는 토스트 + 시트 닫기.
   - Android 뒤로가기: 로그인 폼이 보일 때만 두 번 눌러 종료(`useDoubleBackToExit`), 세션 종료 안내가 보이는 동안은 꺼져 한 번에 종료한다.
   - "로그인이 안 되나요?" 도움말 시트(`login-help-screen.tsx`): 한 번에 하나만 펼치는 아코디언 + 스크롤되지 않는 하단 [카카오톡 상담] [전화 상담].
5. 비밀번호는 `INVALID_CREDENTIALS`이면 지우고, 인증 단계로 갈 때는 남긴다(성공 후 OS 비밀번호 관리자가 저장을 제안할 수 있게). `/verify`는 `openSheet()`로 띄워 그 전에 입력란 블러(`onBlur` 완료, Android는 `Keyboard.dismiss()`도)를 기다린다(시트가 닫혀도 포커스·키보드가 비밀번호 칸으로 돌아오지 않음). **정책: 로그인 화면을 벗어나 진행한 인증 흐름이 성공 없이 끝나 로그인 화면으로 돌아와도 아이디·비밀번호를 그대로 둔다.** 대상은 2단계 인증(X·스와이프·뒤로가기, 발송 한도, 챌린지 만료 등 이유 무관)과 로그인 전 임시비밀번호·만료 비밀번호 변경(취소, 토큰 만료 등 로그인 없이 화면이 제거됨). 로그인 화면은 그동안 스택 아래에 마운트된 채 남아 있고, 돌아올 때 폼을 다시 마운트하거나 지우는 로직이 없다(비밀번호만 지우려면 별도 초기화 처리가 필요해 두 값을 모두 유지하기로 함). `/verify` 시트가 제거되면 `auth-flow-store`의 challenge와 challenge 토큰만 지우고, 비밀번호 변경 화면이 제거되면 변경 토큰만 폐기한다. "로그인이 안 되나요?" 시트(로그인 화면 안의 도움말)도 값 유지. 지우는 경우는 비밀번호 오류뿐이다(`INVALID_CREDENTIALS`: 화면이 보이는 상태라 `passwordResetKey`로 비밀번호만 `clear()`, 아이디 유지). 성공 시에도 OS 비밀번호 저장 제안을 위해 아무것도 바꾸지 않는다. 로그인 전 잠김·정지 안내는 열린 인증 시트·화면을 닫은 뒤 로그인 화면 바로 위에 쌓이고 [로그인 화면으로]가 `dismissAll()`로 같은 로그인 화면에 돌아오므로 값이 남는다(진행 중이던 challenge는 시트 제거 때 지움). 로그인 중 점검·필수 업데이트는 스택을 교체하고 로그아웃하므로 로그인 화면이 새로 마운트되어 빈 칸이다. 로그아웃·세션 만료 후에는 `Stack.Protected`가 로그인 화면을 새로 마운트하므로 처음부터 빈 칸이다. 로그인 mutation은 `gcTime: 0`이고 끝나면 `reset()`해서 변수(비밀번호)가 메모리에 남지 않는다. 같은 요청의 중복 제출은 `inFlight` 가드가 막는다.
6. 로그아웃/401: `signOutLocally()` — 메모리 토큰·세션·진행 중 챌린지를 지우고 쿼리 캐시를 비운다.
7. 로그인 중 차단 오류(503 `MAINTENANCE`, 403 `UPDATE_REQUIRED`, 쿼리·mutation 모든 API): 세션을 끝내고 스택을 차단 화면 하나로 초기화한다(`core/navigation/route-blocking-error.ts`). 열린 시트·모달을 닫고(`router.dismissAll()`) 차단 화면으로 교체(`router.replace`)한 뒤 `signOutLocally()`(토큰·쿼리 캐시 삭제, 세션 종료 안내 없음). 뒤에 앱 화면이 남지 않아 스와이프·헤더 뒤로·Android 뒤로가기로 돌아갈 수 없다(Android 뒤로가기는 앱 종료). 여러 요청이 동시에 실패해도 이동은 한 번(경로 확인 + 1초 중복 방지)이고, `MutationCache.onError`가 mutation 자체 `onError`보다 먼저 처리하므로 화면 표시기(`useErrorPresenter`)는 다시 이동하거나 토스트를 띄우지 않는다. 해제 후에는 로그인부터 다시 한다. 로그인 전(로그인·인증 요청)은 지금 화면 위에 띄우고(`push`) [로그인 화면으로]는 로그인 화면까지 닫는다(`dismissTo`). 보안 위험 기기는 지금 화면 위에 띄운다. 잠김·정지는 로그인 전이면 열린 시트·화면을 로그인 화면까지 닫고(`dismissAll`) 그 위에 띄우고(위 2단계 인증 항목), 로그인 중이면 지금 화면 위에 띄운다.

## 개발용 mock 시나리오 (`auth-api.mock.ts`, 더미 값만)

아이디를 입력한다. 비밀번호는 `wrong` 외에는 아무거나. 자세한 시나리오(`1234`, `merchant`, `kakao`, `changed`, `totp`, `totpnew`, `nocontact`, `lockotp`, `suspended`, `temp`, `update`, `insecure`, `idle`, `offline`, `locked`, `blocked`, `maint`)는 `auth-api.mock.ts` 맨 위 주석. 코드 `000000` = 성공, `999999` = 만료, 그 외 = 오류(화면에 횟수 표시 없음, 5회 오류면 `ACCOUNT_LOCKED`: 인증 시트가 닫히고 로그인 화면 위에 잠김 안내, 이후 그 아이디의 로그인·발송·검증 모두 잠김, JS를 다시 불러오면 풀림). `offline`은 네트워크 오류 토스트 확인용.
mock은 릴리스 번들에서 제거된다 (`__DEV__` 안 `require`; 릴리스 번들에서 `mock-access-token` 문자열 0건으로 확인).

## 서버 연동

개발 기본값은 로컬 서버(`http://localhost:8080`, `EXPO_PUBLIC_API_MOCK=0`)다. 요청/응답 형식과 서버가 맞춰야 할 부분(`data.accessToken`, `userType`)은 `docs/backend-contract/app-migration-server-login.md`. 서버 없이 화면만 보려면 `EXPO_PUBLIC_API_MOCK=1`로 아래 mock 시나리오를 쓴다.

## 환경 변수

`src/shared/config/env.ts`가 시작 시 한 번 검증한다 (누락 시 앱이 바로 오류). `.env.development`는 자리표시 호스트(`api.example.invalid`)와 mock 켜짐. 운영 빌드에는 실제 `EXPO_PUBLIC_API_BASE_URL`이 필요하다 (`.env.example` 참고). 이 값들은 공개되므로 비밀 값 금지.

## 접근성 현황과 한계

- 입력창에는 보이는 라벨과 필드별 오류 자리(`LabeledField`)가 있다. 화면 제목은 iOS에서 `isHeader` trait. 오류 메시지는 `useAnnounce`로 VoiceOver/TalkBack에 낭독한다. Android 제목 heading semantics는 미구현.
- 색 대비는 계산해 정했다: 라이트 브랜드 5.40, 다크 브랜드 4.51~4.65(흰 글자 버튼과 텍스트 버튼 모두 통과하는 좁은 구간), 필드 테두리 3:1 이상. 근거와 수치는 `shared/theme/colors.ts` 주석.
- iOS 텍스트 버튼은 44pt 터치 영역을 위해 라벨 안쪽에 패딩을 둔다 (`native-button.ios.tsx`).

## 미구현 / 다음

- 사용자 타입별 capability 맵과 타입별 탭 구성 (`user-types.md`).
- 로그아웃 UI, 앱 백그라운드 후 경과 시간으로 선로그아웃 (`auth-jwt.md`).
- 운영 서버 연동 (계약 확정 후), 푸시 토큰 전송.
