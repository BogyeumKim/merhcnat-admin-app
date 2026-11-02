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

모든 응답 본문은 `{ code, message, data? }`. 성공은 `code: "SUCCESS"`(HTTP 200) 또는 `MFA_REQUIRED`(HTTP 202, 로그인이 아님). 그 외는 다른 HTTP status와 같은 봉투. `data`에는 필요할 때만 `remainingAttempts`, `retryAfterSeconds`(점검이면 기간) 등이 온다. 앱은 **HTTP status로 먼저, `code`로 다음에** 분기하고 `data`를 zod로 검증한다. `message`는 로그용이며 화면에 쓰지 않는다 (문구는 앱이 `code`로 번역).

## 요청 / 응답

1. `POST /api/auth/login` `{ userId, password, device }`
   - `device`: `{ deviceId(≤64), platform: "IOS"|"ANDROID", osVersion?, deviceModel?, appVersion? }` (`features/auth/model/device-info.ts`)
   - **200 `SUCCESS`** + `Access-Token` 헤더 = 로그인 완료 (등록 기기 + loginType 1). `data: { userId, loginType, userType, deviceState: "MATCH" }`
   - **202 `MFA_REQUIRED`** = 비밀번호 통과, 추가 인증 필요 (**로그인이 아님**). `data: { userId, loginType, userType, deviceState: "NONE"|"MATCH"|"CHANGED", channels, challengeToken }`. loginType 0 → `["TOTP"]`(MATCH여도 항상), 1 → `["KAKAO","SMS"]`, `challengeToken`은 5분 일회용.
2. `POST /api/auth/otp/send` `{ challengeToken, channel: "KAKAO"|"SMS" }` → 200 `SUCCESS` `data: { expiresInSeconds, resendAfterSeconds, maskedPhone }`
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
| 409 `TOTP_NOT_ENROLLED` / 409 `PHONE_NOT_REGISTERED` | 인라인 "관리자에게 문의" |
| 429 `OTP_RESEND_TOO_SOON` / 400 `OTP_CHANNEL_INVALID` | 인라인 |
| 401 `UNAUTHORIZED` | 세션 만료(`TOKEN_EXPIRED`)로 취급 |
| 400 `BAD_REQUEST`, 500 `INTERNAL_ERROR`, 모르는 `code` | `UNKNOWN`(토스트) |

## 앱이 지키는 것

- 202를 성공으로 취급하지 않는다. 로그인 완료는 `Access-Token` 헤더가 있는 200(`SUCCESS`)뿐이다.
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
