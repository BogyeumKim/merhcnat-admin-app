# 서버 API 규약 (이름 · 형식)

서버는 Spring Boot, DB는 MySQL. 아래는 **국제 표준(RFC/W3C)과 널리 쓰는 관행**으로 미리 정한 결정이다. 근거 수준을 항목마다 적었다 (검색 확인 / 일반 지식).

## 1. 경로와 버전

- `https://<host>/v1/...` URL 경로 버전. 경로는 **소문자 kebab-case**, 리소스는 **복수 명사**. 검색 자료에서 소문자 + 하이픈이 공통이고 Zalando 가이드는 kebab-case를 MUST로 둔다 (검색 확인).
- CRUD로 표현하기 어려운 동작은 하위 동작으로 둔다: `/auth/login`, `/auth/logout`, `/auth/challenges/{id}/send`, `/verify`. (실용 선택. 순수 REST는 아님)
- 레거시의 `v1/mobile`, `v2/mobile` 경로는 계승하지 않는다.

## 2. JSON

- UTF-8, **키는 camelCase**, 섞어 쓰지 않는다 (camelCase/snake_case 모두 쓰지만 혼용이 문제라는 자료. 선택은 프로젝트 결정이며 Spring Boot Jackson 기본이 camelCase).
- **응답 래퍼(envelope) 없음.** 성공은 리소스/객체를 그대로, 실패는 §5 problem+json. (레거시의 `res_code` + `returnObj` 방식은 계승하지 않는다.)
- 값이 없는 선택 필드는 생략한다 (`null`로 채우지 않는다).
- **enum 값은 `UPPER_SNAKE_CASE` 문자열** (`CHALLENGE_REQUIRED`, `SMS`). DB 정수값은 노출하지 않는다. **예외: `userType`은 DB 정수**(0, 1, 2, 3, 4, 5, 9)이고 앱이 `UserType` 상수로 파싱한다. 허용 목록 밖은 서버가 로그인 단계에서 막는다.
- ID는 UUID v4 소문자 하이픈 형식 문자열(`challengeId`, `deviceId`). (일반 관행)

## 3. 시각과 기간

- 시각은 **RFC 3339** 문자열 (`2026-10-26T01:00:00Z` 또는 `+09:00` 오프셋 포함). DB(MySQL `DATETIME(3)`)에는 UTC로 저장하고 API는 `Z` 또는 오프셋을 항상 붙인다. (검색은 이 항목을 확인하지 못했다. 일반 관행)
- 기간은 정수 초, 이름에 단위를 붙인다 (`retryAfterSeconds`).

## 4. HTTP 상태

| 상태 | 사용 |
| --- | --- |
| 200 | 성공 (로그인의 `AUTHENTICATED` / `CHALLENGE_REQUIRED` 포함) |
| 204 | 본문 없는 성공 (`send`, `logout`) |
| 400 | 형식 오류, 코드 불일치/만료 (`OTP_INVALID`, `OTP_EXPIRED`) |
| 401 | 인증 실패/토큰 만료 (`INVALID_CREDENTIALS`, `TOKEN_EXPIRED`) |
| 403 | 인증됐지만 불가 (`ACCOUNT_TYPE_NOT_ALLOWED`) |
| 409 | 상태 충돌 (이미 소진된 챌린지 등) |
| 429 | 요청/시도 과다 (`OTP_LOCKED`, `TOO_MANY_REQUESTS`) + `Retry-After` |
| 503 | 점검 (`MAINTENANCE`) + `Retry-After` |

RFC 9457 예시가 권한 부족에 403을 쓰는 점, 점검에 503 + `Retry-After`를 쓰는 점은 검색으로 확인했다. 나머지 매핑은 일반 관행이다.

## 5. 오류 형식: RFC 9457 `application/problem+json`

```json
{ "type": "https://<서버 도메인>/problems/maintenance",
  "title": "Service under maintenance",
  "status": 503,
  "code": "MAINTENANCE",
  "scope": "USER_TYPE",
  "startAt": "2026-10-26T01:00:00Z",
  "endAt": "2026-10-26T03:00:00Z" }
```

- `type`/`title`/`status`/`detail`/`instance`는 RFC 9457 표준 필드. **`code`(UPPER_SNAKE_CASE)가 앱이 쓰는 안정적인 키**다. 클라이언트는 모르는 확장 필드를 무시해야 한다 (RFC 9457).
- 사람이 읽는 `title`/`detail`은 로그/디버깅용이다. 화면 문구는 앱이 `code`를 i18n으로 번역한다. 서버 문장을 보여줘야 하는 경우만 `Accept-Language`(ko/en)를 보고 서버가 별도 필드(`displayMessage`)를 번역해서 준다.
- 검증 오류는 `errors: [{ "field": "code", "code": "REQUIRED" }]` 확장.
- Spring Boot는 `ProblemDetail`/`@ControllerAdvice`로 지원한다 (일반 지식, 사용 버전에서 확인 필요).

## 6. 헤더

| 헤더 | 용도 | 근거 |
| --- | --- | --- |
| `Authorization: Bearer <JWT>` | 요청 인증 | RFC 6750 (일반 지식) |
| `Access-Token: <JWT>` | **응답**: 슬라이딩 만료로 연장된 새 토큰 | 표준 없음. 커스텀 헤더. **새 헤더에 `X-` 접두를 쓰지 않는다**: RFC 6648이 `X-` 권고를 폐기 (검색 확인) |
| `Accept-Language: ko` / `en` | 서버가 번역할 문구가 있을 때 | HTTP 표준 |
| `traceparent` | 요청 추적 | W3C Trace Context (헤더 이름 검색 자료에서 확인 필요 표기. Spring의 Micrometer Tracing이 기본 지원, 일반 지식) |
| `Retry-After` | 429/503 | HTTP 표준 (검색 확인) |
| `Cache-Control: no-store` | 인증 응답 | 일반 보안 관행 |

- **WebView 주의:** 웹 프로젝트(브라우저 JS)가 API를 직접 호출할 때 `Access-Token` 같은 커스텀 응답 헤더는 서버가 `Access-Control-Expose-Headers: Access-Token`을 보내야 JS에서 읽을 수 있다. 네이티브 `fetch`는 이 제약이 없다.
- 새 토큰을 `Authentication-Info`(RFC 7615) 같은 표준 헤더로 줄 수도 있으나 쓰는 곳이 드물어 `Access-Token`을 제안한다 (일반 지식).

## 7. JWT

- 등록 클레임만 사용: `iss`, `sub`, `aud`, `iat`, `exp`, `jti` (RFC 7519). **`sub`는 불투명한 내부 식별자**이고 로그인 ID나 개인정보를 claim에 넣지 않는다 (payload는 누구나 읽을 수 있음).
- 알고리즘을 서버가 고정하고 `alg: none`을 거부한다 (RFC 8725 계열 권고. 일반 지식).
- 수명 약 10분, 만료 임박 시 새 토큰을 `Access-Token` 헤더로 내린다. 절대 만료 상한을 둔다 (`docs/architecture/auth-jwt.md`).

## 8. 개인정보

- 요청/응답/로그/DB 예시에는 더미 값만 쓴다. 문자·메일 목적지는 서버가 마스킹해서 내린다. 인증 코드, 기기 식별자, 토큰은 로그에 남기지 않는다.
