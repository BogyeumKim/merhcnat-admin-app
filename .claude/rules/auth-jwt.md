---
paths:
  - "src/features/auth/**"
  - "src/shared/api/**"
---

# 인증 규칙

근거와 계약 질문: `docs/architecture/auth-jwt.md`, `device-binding.md`, `api-conventions.md` (백엔드 JWT는 아직 없음)

- **refresh token은 없다.** 앱을 실행하면 항상 로그인이 필요하다. 토큰을 `expo-secure-store`, `shared/lib/storage`, zustand `persist` 등 **어디에도 영속 저장하지 않는다.** 메모리에만 둔다.
- 서버가 응답 헤더로 연장된 새 토큰을 주면(슬라이딩 만료) API 클라이언트가 메모리의 토큰을 교체한다. 서버 계약(헤더 이름 등) 확정 전에 임의로 구현하지 않는다.
- 요청 인증은 `Authorization: Bearer <access token>`. 토큰을 URL/쿼리스트링/로그에 넣지 않는다.
- 401이면 즉시 로그아웃하고 **쿼리 캐시를 비운다.** 재시도/refresh를 만들지 않는다.
- 서버 오류는 HTTP 200이 아닌 status + 안정적인 `code`로 온다. 앱은 `code`를 i18n(`errors.<code>`)으로 번역해 보여주고 모르는 코드는 일반 문구로 처리한다. 서버가 준 문장을 그대로 화면에 쓰지 않는다.
- HTTP 클라이언트는 전역 `fetch`(= `expo/fetch`) 위의 얇은 래퍼를 권장한다 (사용자 확정 전). `AbortSignal.timeout`으로 타임아웃을 건다.
- JWT payload는 누구나 읽을 수 있다. 개인정보를 claim에 넣도록 서버에 요구하지 않고, 앱은 payload를 화면 데이터 출처로 쓰지 않는다. `exp`는 UX용이다.
- 기기 식별자(`deviceId`, Android ID 등)와 인증 코드는 로그/커밋/문서/예시 데이터에 남기지 않는다. 인증 통과 여부는 서버만 판단하고, 추가 인증 필요 응답에서 원 요청을 자동 재시도하지 않는다.
- 사용자 타입/소유 id를 요청에 실어 보내지 않는다. 서버가 토큰으로 판단한다.
- 로그인 응답은 `status`로 구분되는 두 가지다: `AUTHENTICATED`(토큰은 응답 헤더 `Access-Token`) 또는 `CHALLENGE_REQUIRED`(`challengeId`, `deviceState`, `methods`). TOTP(OTP 타입 0)는 매 로그인 코드 검증, 그 외(타입 1)는 기기 등록·교체 때만 최초 1회 인증하며 이때 문자/메일/카카오 중 수단을 사용자가 고른다 (`device-binding.md`).
- 앱은 인증 수단만 고르고 **번호/메일 주소를 보내지 않는다.** 목적지는 서버가 유저 테이블에서 꺼내고 앱에는 마스킹된 값만 온다. 인증 코드는 로그에 남기지 않는다.
- 기기 값: 설치 단위 랜덤 UUID(`deviceId`, `expo-secure-store`, iOS는 `WHEN_UNLOCKED_THIS_DEVICE_ONLY`). Android는 추가로 `getAndroidId()`를 `androidId`로 보낸다 (서버가 해시로만 저장). iOS는 IDFV를 쓰지 않는다 (재설치 시 바뀔 수 있음). iOS Keychain 유지는 보장되지 않으므로 못 알아봐도 안전하게 재인증으로 폴백한다. 이 값들은 로그/커밋/문서/예시에 남기지 않는다.
- 한 기기에는 한 userId만 바인딩된다. 다른 계정으로 로그인하면 인증 후 기기가 그 계정으로 옮겨지고 이전 계정은 다음 로그인에서 재인증한다.
- 점검(`503 MAINTENANCE`)은 서버가 준 문장이 아니라 시각 필드를 앱 언어로 포맷해 보여준다. 점검 응답에서 자동 재시도하지 않는다.
- 구현 위치: `shared/api/client.ts`(fetch 래퍼, 응답 헤더 `Access-Token`으로 메모리 토큰 교체, 401이면 `signOutLocally`), `shared/api/session-token.ts`(메모리 토큰), `features/auth/model/session-store.ts`(zustand, 영속 저장 없음, `userType`만 보관). 헤더 이름은 서버와 합의 전 제안값이다.
- 로그인 여부는 `userType !== null`로 판단한다 (`0`이 유효한 타입).
