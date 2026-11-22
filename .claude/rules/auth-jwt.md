---
paths:
  - "src/features/auth/**"
  - "src/shared/api/**"
---

# 인증 규칙

근거와 계약 질문: `docs/architecture/auth-jwt.md`, `device-binding.md`, `api-conventions.md` (백엔드 JWT는 아직 없음)

- **refresh token은 없다.** 앱을 실행하면 항상 로그인이 필요하다. 토큰은 **zustand 메모리 store**(`shared/api/session-token.ts`, `persist` 없음)에만 둔다. `expo-secure-store`, `shared/lib/storage`, zustand `persist` 등 **어디에도 영속 저장하지 않는다** (앱을 다시 켜면 어차피 재로그인이므로 디스크에 남길 이유가 없고, 남기면 탈취 표면만 늘어난다).
- 서버가 응답 헤더로 연장된 새 토큰을 주면(슬라이딩 만료) API 클라이언트가 메모리의 토큰을 교체한다. 서버 계약(헤더 이름 등) 확정 전에 임의로 구현하지 않는다.
- 요청 인증은 `Authorization: Bearer <access token>`. 토큰을 URL/쿼리스트링/로그에 넣지 않는다.
- 401(`SESSION_REPLACED` 다른 로그인이 대체, `SESSION_EXPIRED` 15분 유휴·세션 삭제, `UNAUTHORIZED`)이면 즉시 로그아웃하고 **쿼리 캐시를 비운다.** 재시도/refresh를 만들지 않는다. 이유는 `notifyUnauthorized(code)` → `sessionEnded`(`replaced`/`expired`)로 로그인 화면 안내에 쓴다. **예외: 503 `SESSION_STORE_UNAVAILABLE`은 세션 저장소 장애라 토큰을 유지하고 로그아웃하지 않는다**(토스트 + 재시도, 점검 화면 아님). 로그인 중 비밀번호 변경(`PUT /api/users/me/password`) 성공은 로그아웃하지 않는다: 서버가 세션을 새 토큰으로 교체해 `Access-Token` 헤더로 주고(이전 토큰은 `SESSION_REPLACED`) 클라이언트가 메모리 토큰을 바꾼다. 앱은 `markPasswordChanged()` + 성공 토스트(`password-changed`)만 한다.
- 서버 오류는 HTTP 200이 아닌 status + 안정적인 `code`로 온다. 앱은 `code`를 i18n(`errors.<code>`)으로 번역해 보여주고 모르는 코드는 일반 문구로 처리한다. 서버가 준 문장을 그대로 화면에 쓰지 않는다.
- HTTP 클라이언트는 전역 `fetch`(= `expo/fetch`) 위의 얇은 래퍼다 (확정). `AbortSignal.timeout`으로 타임아웃을 건다.
- JWT payload는 누구나 읽을 수 있다. 개인정보를 claim에 넣도록 서버에 요구하지 않고, 앱은 payload를 화면 데이터 출처로 쓰지 않는다. `exp`는 UX용이다.
- 기기 식별자(`deviceId`, Android ID 등)와 인증 코드는 로그/커밋/문서/예시 데이터에 남기지 않는다. 인증 통과 여부는 서버만 판단하고, 추가 인증 필요 응답에서 원 요청을 자동 재시도하지 않는다.
- 사용자 타입/소유 id를 요청에 실어 보내지 않는다. 서버가 토큰으로 판단한다.
- 로그인 응답(계약: `docs/backend-contract/app-migration-server-login.md`)은 HTTP 200 `SUCCESS`(+ `Access-Token` 헤더 = 로그인 완료) 또는 200 `MFA_REQUIRED`(`challengeToken`, `deviceState`, `channels`[{channel, destination}], `lastUsedChannel`, 로그인 아님)다. **1차 HTTP status, 2차 `code`로 분기**하고 `message`로 분기하지 않는다. 빈 `channels`는 연락처 없음(인증 시트가 안내). TOTP(OTP 타입 0)는 매 로그인 코드 검증, 그 외(타입 1)는 기기 등록·교체 때만 최초 1회 인증하며 이때 카카오/문자/이메일 중 서버가 내려준 수단(휴대폰·이메일 컬럼이 비어 있지 않은 것)을 사용자가 고른다 (`device-binding.md`).
- 앱은 인증 수단만 고르고 **번호/메일 주소를 보내지 않는다.** 목적지는 서버가 유저 테이블에서 꺼내고 앱에는 마스킹된 값만 온다. 인증 코드는 로그에 남기지 않는다.
- 기기 값: 설치 단위 랜덤 UUID(`deviceId`, `expo-secure-store`, iOS는 `WHEN_UNLOCKED_THIS_DEVICE_ONLY`). `androidId`는 서버가 제거해서 보내지 않는다. iOS도 IDFV를 쓰지 않는다. **재설치 = 새 기기**(iOS/Android, 2026-11 결정): iOS Keychain은 앱 삭제 후에도 남으므로 설치 후 첫 실행에 `fresh-install.ts`가 `device.id`·`device.secret`(+레거시 `login.savedUserId`)을 지운다(표식은 kv-store `STORAGE_KEYS.installMarker`, 앱 시작 시 호출, 기기 값 접근 전에 같은 promise를 기다림, 실패해도 로그인을 막지 않음). 이 값들은 로그/커밋/문서/예시에 남기지 않는다.
- **기기 비밀키:** 등록 완료 응답의 `deviceSecret`은 한 번만 온다. `device-secret.ts`로 SecureStore에 저장하고 로그인 `device`와 `PUT /api/devices/me`에 보낸다. 로그인 토큰과 달리 다음 실행에도 필요하므로 영속 저장 대상이다. 로그·문서·예시에 값을 남기지 않는다.
- 한 기기에는 한 userId만 바인딩된다. 다른 계정으로 로그인하면 인증 후 기기가 그 계정으로 옮겨지고 이전 계정은 다음 로그인에서 재인증한다.
- 점검(`503 MAINTENANCE`)은 시각 필드(`startedAt`/`endsAt`)만 앱 언어로 포맷해 보여주고, 문구는 모두 i18n이다. 서버 `message`는 점검을 포함해 어떤 화면에도 쓰지 않는다. 점검 응답에서 자동 재시도하지 않는다. 모든 요청에 `X-App-Version`·`X-App-Platform`을 함께 보내고(버전을 못 읽으면 둘 다 생략), 426 `UPDATE_REQUIRED`는 필수 업데이트 화면. **로그인 중 받은 점검·필수 업데이트는 세션을 끝낸다**: 열린 시트를 닫고 스택 전체를 차단 화면 하나로 바꾼 뒤 `signOutLocally()`(안내 없음). 차단 화면 뒤에 앱 화면을 남기지 않는다. 이동은 `core/navigation/route-blocking-error.ts` 한 곳(`QueryCache`/`MutationCache` `onError`, `useErrorPresenter` 모두 `navigateToBlockingScreen` 경유)에서만 한다.
- 구현 위치: `shared/api/client.ts`(fetch 래퍼, 응답 헤더 `Access-Token`으로 메모리 토큰 교체, 401이면 `signOutLocally`), `shared/api/session-token.ts`(zustand vanilla 메모리 토큰 + 세션 세대), `features/auth/model/session-store.ts`(zustand, 영속 저장 없음, `userType`·`userId` 보관: `userId`는 서버 `data.userId` 우선, 없으면 입력값이며 비밀번호 규칙 힌트 전용), 개발 mock은 `features/auth/api/auth-api.mock.ts` (`docs/architecture/login-ui.md`). 헤더 이름은 서버와 합의 전 제안값이다.
- 로그인 여부는 `userType !== null`로 판단한다 (`0`이 유효한 타입).
- **임시비밀번호**: 로그인·코드 검증이 200 `PASSWORD_CHANGE_REQUIRED`(`challengeToken`)를 주면 토큰 헤더가 없으므로 홈으로 보내지 않고 `/temp-password`에서 `POST /api/auth/password/temp`로 변경해야 로그인이 완료된다. 토큰은 `temp-password-vault`(메모리, 5분)에만 두고 건너뛰기는 없다.
