# 서버 계약: app-migration-server 로그인 + OTP (앱이 요청하는 형식)

앱의 `realAuthApi`(`features/auth/api/auth-api.ts`)가 이 서버를 기준으로 요청한다. 서버 코드는 별도 저장소(`app-migration-server`, Spring Boot)이고, 이 문서는 앱이 기대하는 값만 적는다. 값은 모두 더미다. 이전 계약(login 200 + `Access-Token`, 매 요청 userId+password)은 폐기됐다.

## 흐름

```
login ──(otpRequired:false)──────────────────────────▶ 로그인 완료 (Access-Token 헤더)
  │ otpRequired:true + challengeToken
  ▼
[deviceState NONE/CHANGED면 새 기기 안내] → loginType 1: 채널 선택(KAKAO/SMS) → otp/send → 코드 입력
                                         → loginType 0: 바로 코드 입력(TOTP)
  ▼
otp/verify ──────────────────────────────────────────▶ 로그인 완료 (Access-Token 헤더, 서버가 기기 등록/교체)
```

## 응답 봉투

모든 응답 본문은 `{ code, message, data? }`. **각 단계가 성공하면 200**이고 다음 단계는 `code`로 구분한다: `SUCCESS`(로그인 완료, `Access-Token`), `MFA_REQUIRED`, `PASSWORD_CHANGE_REQUIRED`(2026-11 확정, 200 외 2xx 미사용). 실패만 4xx/5xx(1차 status, 2차 code). 앱은 직전 계약(401/403)과 그 이전(202)도 호환한다. 그 외는 다른 HTTP status와 같은 봉투. 필수값 누락은 400 `BAD_REQUEST` + `data.fieldErrors[{field, reason}]`. `data`에는 필요할 때만 `remainingAttempts`, `retryAfterSeconds`(점검이면 기간) 등이 온다. 앱은 **HTTP status로 먼저, `code`로 다음에** 분기하고 `data`를 zod로 검증한다. `message`는 로그용이며 화면에 쓰지 않는다 (문구는 앱이 `code`로 번역).

## 요청 / 응답

1. `POST /api/auth/login` `{ userId, password, device }`
   - `device`: `{ deviceId(≤64), platform: "IOS"|"ANDROID", osVersion?, deviceModel?, appVersion? }` (`features/auth/model/device-info.ts`)
   - **200 `SUCCESS`** + `Access-Token` 헤더 = 로그인 완료 (등록 기기 + loginType 1). `data: { userId, loginType, userType, deviceState: "MATCH" }`
   - **200 `MFA_REQUIRED`** = 비밀번호 통과, 추가 인증 필요 (**로그인이 아님**). `data: { userId, loginType, userType, deviceState: "NONE"|"MATCH"|"CHANGED", channels, lastUsedChannel?, challengeToken }`. `challengeToken`은 5분이며, `otp/send`가 성공할 때마다 "새 OTP 만료 + 60초"까지 연장된다(로그인 후 최대 15분, 서버 DB가 관리, 토큰 값은 그대로). 상한을 넘기면 401 `CHALLENGE_EXPIRED` → 처음부터 로그인. 비밀번호 변경 토큰은 5분 고정.
     - `channels`: `[{ channel, destination }]`(서버가 마스킹: `010-****-0000`, `te****@example.com`). loginType 0 → `[{ channel: "TOTP" }]`(MATCH여도 항상). loginType 1 → `user.phone_number`가 NULL/''이 아니면 KAKAO·SMS, `user.email`이 NULL/''이 아니면 EMAIL(순서 KAKAO, SMS, EMAIL).
     - **둘 다 비어 있으면 `channels: []`**(같은 200 `MFA_REQUIRED`, 409 아님). 앱은 인증 시트에 "등록된 연락처가 없어요"를 보여주고 `otp/send`를 부르지 않는다.
     - `lastUsedChannel`: `user_info.last_otp_channel`(OTP 검증 성공 시 기록). 앱의 "최근 사용" 배지. 이력 없으면 생략.
     - 앱은 이전 형식(문자열 배열)도 받는다.
2. `POST /api/auth/otp/send` `{ challengeToken, channel: "KAKAO"|"SMS"|"EMAIL" }` → 200 `SUCCESS` `data: { expiresInSeconds, resendAfterSeconds, maskedDestination, remainingSends? }`(앱은 이전 이름 `maskedPhone`도 받음). 해당 채널 컬럼이 비어 있으면 400 `OTP_CHANNEL_INVALID`. 메일은 Outlook 발송.
3. `POST /api/auth/otp/verify` `{ challengeToken, channel: "TOTP"|"KAKAO"|"SMS", otp }` → 200 `SUCCESS` + **`Access-Token` 헤더**, `data: { userId, loginType, userType, deviceState: "MATCH" }`. 서버가 이 시점에 기기를 등록/교체한다.
4. `PUT /api/devices/me` (Bearer) `{ expoPushToken? }` → 200 `SUCCESS`(data 없음). `notificationsEnabled`는 서버에서 제거됐다(보내도 무시, 허용 여부는 토큰 유무로 판단). 앱은 **로그인이 끝날 때마다**(바로 완료든 OTP 후든) 알림 권한을 요청(OS는 아직 선택 전일 때만 창을 띄움)하고, 허용되면 `expoPushToken`을 보낸다. 실제 토큰을 발급할 수 없는 동안은 `ExponentPushToken[<랜덤 22자>]` 임시 값을 보낸다(서버는 접두사와 길이 255 이하만 검사, expo_push_token은 UNIQUE라 값은 기기마다 고유해야 함). `user_info.push_enabled`(앱 내 알림 마스터 스위치, 1/0)는 이 API로 바뀌지 않는다. 필요하면 서버에 별도 API를 요청한다 (`features/auth/model/device-push.ts`). 실패해도 로그인에는 영향 없고 다음 로그인 때 다시 시도한다.

## 잠금 정책

비밀번호 오류와 OTP 오류를 합쳐 `password_fail_count`를 올리고, **5가 되는 요청부터 423 `ACCOUNT_LOCKED`(영구, 관리자 해제)**. OTP 단계에 들어가도 카운트는 초기화되지 않고 **최종 로그인 성공에서만 0**. `remainingAttempts = 5 - 현재 카운트`. (`ACCOUNT_LOCKED_TEMP`, `OTP_ATTEMPTS_EXCEEDED`는 없어졌다.)

## 오류 (앱은 `errors.<code>`로 번역한다)

| HTTP / `code` | 앱 처리 |
| --- | --- |
| 401 `INVALID_CREDENTIALS` (login) | 폼 위 인라인 한 문장. **`data.remainingAttempts`는 로그인 화면에서 보여주지 않는다** (아래 주의) |
| 423 `ACCOUNT_LOCKED` | 안내 화면 `/account-locked` (관리자에게 문의, **재시도 버튼 없음**). 로그인/OTP 어느 단계에서든 |
| 403 `UNSUPPORTED_LOGIN_TYPE` | 인라인 |
| 400 `DEVICE_REQUIRED` / `DEVICE_INVALID` | 토스트 (앱 버그 성격) |
| 401 `OTP_INVALID` + `data.remainingAttempts` | 코드 필드 아래 "N번 더 틀리면 다시 로그인" |
| 401 `OTP_EXPIRED` | 인라인 + 다시 받기 즉시 활성화 |
| 401 `CHALLENGE_EXPIRED` | 토스트 + 로그인 화면으로 (토큰 만료: 처음부터) |
| 409 `TOTP_NOT_ENROLLED` | 인라인 "관리자에게 문의" |
| 400 `OTP_CHANNEL_INVALID` (이전 서버의 429 `OTP_RESEND_TOO_SOON`도 받으면 인라인, 현재 서버는 보내지 않음) | 인라인 |
| 429 `OTP_SEND_LIMIT_EXCEEDED` (챌린지당 5회 초과, `data` 없음) | 토스트 + 인증 시트 닫기 (`CHALLENGE_EXPIRED`와 같음: 처음부터 로그인) |
| 401 `UNAUTHORIZED` | 세션 만료(`TOKEN_EXPIRED`)로 취급 |
| 400 `BAD_REQUEST`, 500 `INTERNAL_ERROR`, 모르는 `code` | `UNKNOWN`(토스트) |

## 앱이 지키는 것

- 200이면 `code`로 다음 단계, 4xx/5xx는 1차 status·2차 `code`로 오류 분기. `message`는 분기에 쓰지 않는다.
- 로그인 완료는 `Access-Token` 헤더가 있는 200 `SUCCESS`뿐이다.
- 비밀번호는 `login` 호출에만 쓰고 바로 버린다 (mutation 변수 `gcTime: 0`, 호출 후 `reset()`). 이후 단계는 `challengeToken`만 쓴다.
- `challengeToken`은 메모리 전용 모듈 변수(`model/challenge-vault.ts`)에만 두고, 성공/취소/로그아웃/새 로그인/5분 경과 시 폐기한다. 디스크, SecureStore, React 상태, 쿼리 캐시, 로그에 두지 않는다.
- `Access-Token`이 없는 200 로그인은 계약 위반(`INVALID_RESPONSE`)이라 로그인으로 치지 않는다.
- 사용자 타입은 `0, 1, 2, 3, 4, 5, 9`만 받는다. 아니면 `INVALID_RESPONSE`.

## 주의 (서버 쪽 결정에 대한 앱 의견)

- **계정 존재 여부 노출:** `INVALID_CREDENTIALS`의 `data.remainingAttempts`가 존재하는 아이디에만 오고 없는 아이디는 `data`가 없다. 화면에 횟수를 보여주면 공격자가 아이디 존재 여부를 구분할 수 있어서 앱은 로그인 실패에서 횟수를 쓰지 않는다. (OTP 단계는 이미 계정이 확인된 뒤라 횟수를 보여준다.)
- **영구 잠금의 부작용:** 누구나 남의 아이디로 5번 틀리면 그 계정을 잠글 수 있다 (관리자 해제 전까지 사용 불가). 정책은 서버/사용자 결정이므로 앱은 그대로 따른다.

## 미구현 / 결정 필요

- **푸시 토큰 발급 조건.** `getExpoPushTokenAsync`에는 EAS `projectId`(`eas init`으로 `app.json`의 `extra.eas.projectId`), Android는 Firebase(`google-services.json`), iOS는 Apple 푸시 자격 증명(유료 개발자 계정)이 필요하다. 지금은 없어서 **허용 시 임시 랜덤 토큰을 보낸다**(`device-push.ts`의 `placeholderPushToken`, 실제 발급이 가능해지면 제거) (`expo-notifications`는 네이티브 모듈이라 prebuild + 재빌드 후부터 동작한다).
- `loginType 0`의 TOTP 등록 API는 서버에 아직 없다 (`TOTP_NOT_ENROLLED` 안내만 한다).

## 환경

- iOS 시뮬레이터: `http://localhost:8080` 그대로 (Info.plist의 `NSAllowsLocalNetworking`).
- Android 에뮬레이터: 개발 빌드에서 `localhost`를 `10.0.2.2`로 바꿔 요청한다 (`shared/config/env.ts`). 실기기는 `EXPO_PUBLIC_API_BASE_URL`에 PC의 LAN IP를 쓴다. 평문 HTTP는 개발 빌드에서만 가정한다.
- `.env.development`는 `EXPO_PUBLIC_API_MOCK=0`이라 서버가 떠 있어야 로그인된다. 서버 없이 화면만 보려면 `EXPO_PUBLIC_API_MOCK=1` (mock 시나리오는 `auth-api.mock.ts` 주석 / `login-ui.md`).
- `.env` 값을 바꾸면 Metro를 다시 시작해야 반영된다 (`npx expo start --clear`).
- 서버가 비밀번호를 평문으로 저장·비교한다고 안내받았다. 로컬 전용이라면 괜찮지만 그 외에는 해시 저장이 필요하다.

## 보안 변경 (2026-11, 서버 확정)

- **로그인 실패 통일:** 없는 아이디·틀린 비밀번호·삭제 계정 모두 401 `INVALID_CREDENTIALS`, `data` 없음(`remainingAttempts` 제거). 423 `ACCOUNT_LOCKED`는 비밀번호가 맞았을 때만. `OTP_INVALID`·`CURRENT_PASSWORD_INVALID`의 `remainingAttempts`는 유지.
- **기기 비밀키 `deviceSecret`:** OTP 검증 또는 `password/temp`로 기기를 등록한 200 `SUCCESS`의 `data.deviceSecret`(43자)이 **한 번만** 온다. 앱은 `expo-secure-store`(`device.secret`, THIS_DEVICE_ONLY)에 보관하고 로그인 `device.deviceSecret`(≤128자)와 `PUT /api/devices/me`(필수)에 보낸다(`features/auth/model/device-secret.ts`). OTP 생략 조건은 메시지형 + `deviceId` 일치 + `deviceSecret` 일치. 기존 등록 기기는 비밀키가 없어 업데이트 후 첫 로그인에 OTP를 한 번 거친다.
- **다른 계정 소유 기기:** `MFA_REQUIRED` `data.deviceRegisteredToOtherAccount: true`(그때 `registeredUserIdMasked` 없음). 앱은 "이 기기는 다른 계정에 등록돼 있어요" 안내. 본인의 다른 기기면 기존처럼 `registeredUserIdMasked`.
- **비밀번호 90일 만료:** 200 `PASSWORD_CHANGE_REQUIRED` `data: { userId, challengeToken, reason: "TEMP_PASSWORD" | "PASSWORD_EXPIRED" }`(둘 다면 TEMP_PASSWORD). 흐름은 `password/temp`로 같고 문구만 다르다.
- **`PUT /api/devices/me`:** `{ deviceSecret, expoPushToken? }`. 403 `DEVICE_NOT_VERIFIED`(비밀키 불일치), 400(누락), 404 `DEVICE_NOT_FOUND`, 400 `PUSH_TOKEN_INVALID`. 앱은 비밀키가 없으면 호출하지 않는다.
- **길이 상한(400 `BAD_REQUEST` + fieldErrors):** userId 30, password 64, otp 10, challengeToken 2048, channel 10, deviceId 64, platform 10, 기기 문자열 100, expoPushToken 255, deviceSecret 128. 앱은 로그인 입력란에 30/64 `maxLength`.
- **재전송:** 같은 채널 대기(쿨다운)는 없다(2026-11 삭제, 429 `OTP_RESEND_TOO_SOON` 더는 안 보냄). 같은 채널이든 다른 채널이든 한도 안의 모든 발송은 즉시 새 코드를 보낸다(이전 코드 무효). 예: 카카오톡 → 문자 → 다시 카카오톡도 바로 발송. `otp/send` 200의 `resendAfterSeconds`는 코드 입력 화면 "N초 후 다시 받기" 링크의 UI 타이머일 뿐 서버가 강제하지 않는다. 발송 한도는 **챌린지당 모든 채널 합쳐 5회뿐**이다: 6번째 요청은 429 `OTP_SEND_LIMIT_EXCEEDED`(`data` 없음, `retryAfterSeconds` 없음). 앱은 토스트를 띄우고 인증 시트를 닫아 처음부터 로그인하게 한다(대기 시간 안내 없음). 사용자당 시간당 한도는 없어졌다(2026-11). `otp/send` 200은 선택 필드 `remainingSends`(남은 발송 횟수)를 줄 수 있다. 앱은 받아 두기만 하고 화면에 쓰지 않는다.


## 단일 세션 (2026-11)

계정당 세션은 하나다. 보호 API(`/api/home/summary`, `/api/notices/popup`, `/api/devices/me`, `/api/users/me/password`)가 아래를 줄 수 있다.

| 응답 | 의미 | 앱 동작 |
| --- | --- | --- |
| 401 `SESSION_REPLACED` | 다른 로그인(다른 기기 또는 새 로그인)이 이 토큰을 무효화 | 토큰 폐기, 쿼리 캐시 삭제, 로그인 화면에서 "다른 기기에서 로그인했어요" 안내 (`sessionEnded = 'replaced'`) |
| 401 `SESSION_EXPIRED` | 15분 동안 API 호출 없음, 또는 세션 삭제 | 같은 정리 후 유휴 만료 안내 (`'expired'`, `SESSION_IDLE_MINUTES = 15`) |
| 401 `UNAUTHORIZED` | 토큰 없음/유효하지 않음(앱 코드 `TOKEN_EXPIRED`로 매핑) | `'expired'`와 같은 안내 |
| 503 `SESSION_STORE_UNAVAILABLE` | 서버 세션 저장소 장애 | **로그아웃하지 않는다.** 토큰 유지, 쿼리는 5xx 규칙으로 재시도, 최종 실패 시 토스트("잠시 후 다시 시도해 주세요", 전역 `QueryCache.onError`), mutation은 `presentationOf` = `toast`. envelope가 있으므로 점검(`MAINTENANCE`)으로 처리하지 않는다(envelope 없는 503만 점검) |

- 401 판단은 `shared/api/client.ts`가 토큰을 실은 같은 세션 요청에만 하며, 응답 `code`를 `notifyUnauthorized(code)`로 넘겨 `session-store`가 이유를 고른다.
- `PUT /api/users/me/password` 성공은 200 `SUCCESS`(data 없음) + **`Access-Token` 응답 헤더(새 토큰)**다. 서버가 세션을 새 토큰으로 교체하므로 이전 토큰은 401 `SESSION_REPLACED`가 된다. 기기 등록·`deviceSecret`은 그대로다. 앱은 **다시 로그인시키지 않는다**: `apiEnvelope`가 응답 수락 뒤 메모리 토큰을 교체하고, 앱은 비밀번호 변경 요구 상태를 풀어(`markPasswordChanged()`, `Stack.Protected`가 홈으로 보냄) "비밀번호를 바꿨어요" 성공 토스트를 띄운다. 임시비밀번호 변경(`POST /api/auth/password/temp`)은 그대로 로그인까지 완료한다.
- 비밀번호 정책: 8~20자, 영문(A-Z/a-z)·숫자(0-9)·특수문자(공백 없는 출력 가능 ASCII 기호 ``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~``) 모두 포함, 그 외 문자(한글, 공백, 이모지, 전각)는 불가 → 400 `PASSWORD_POLICY_VIOLATION` `violations: ["CHARSET"]`. 아이디 포함 금지, 최근 비밀번호 재사용 금지는 서버만 판단한다. 앱의 규칙 목록 "영문·숫자·특수문자 모두 포함" 줄은 허용 밖 글자가 있으면 실패로 바뀌고 문구가 "영문·숫자·특수문자만 쓸 수 있어요 (공백·한글·이모지 불가)"로 바뀐다(`password-rules.ts`).
