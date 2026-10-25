# API 규약: 오류 응답, HTTP 클라이언트

## 1. 로그인 거부(타입 10 등)를 200으로 내려줄까, 오류 status로 내려줄까

**권장: 오류 status + 안정적인 오류 코드.** 200으로 성공처럼 내려주고 본문으로 구분하는 방식은 권하지 않는다.

근거와 한계:
- RFC 9457(Problem Details for HTTP APIs)의 예시는 권한 부족류에 **403**을 쓰고, 본문에 기계가 읽는 타입/확장 필드를 둔다. 클라이언트는 모르는 확장 필드를 무시해야 해서 안정적인 `code` 필드를 추가하기 안전하다.
- 검색에서 "로그인 거부를 200 + 오류 본문으로 내리는 것이 표준"이라는 자료는 찾지 못했다. 반대로 200을 권하는 자료도 없었다. 이 항목은 일반적인 REST 관행과 RFC 예시에 근거한 판단이다.
- 레거시는 200 안에 `res_code`(`0000` 등)를 넣는 방식이었다. 새 서버는 200이 아닌 status를 쓰기로 이미 결정했고, 이는 위 권장과 같다.

권장 형식 (RFC 9457 기반, 필드 예시):

```json
{ "type": "…/login-denied", "title": "Account type not allowed", "status": 403,
  "code": "ACCOUNT_TYPE_NOT_ALLOWED" }
```

- 인증 실패(비밀번호 오류)는 401, 계정은 확인됐지만 접근 불가(타입 10)는 403을 권장. 추가 인증 필요는 `device-binding.md`의 `code`로 구분. 정확한 status는 서버와 합의.

## 2. 서버가 메시지를 동적으로 내려주는 것이 나은가

앱이 **한국어/영어 두 언어**를 지원하므로 서버가 만든 문장을 그대로 보여주면 앱 언어와 어긋날 수 있다.
- **권장:** 서버는 안정적인 `code`만 내려주고, 앱이 `errors.<code>`를 i18n으로 번역해 보여준다. 모르는 코드는 일반 오류 문구로 대체한다.
- RFC 9457 예시도 사람이 읽는 `title/detail`은 부가 정보이고, 클라이언트가 `code`/`type`으로 처리하는 패턴이다 (이 부분은 예시로부터의 추론).
- 점검 공지처럼 서버가 정말 동적 문구를 줘야 한다면 `Accept-Language`(ko/en)를 보고 서버가 번역해서 주는 별도 필드(`displayMessage`)를 두는 방식을 쓴다.

## 3. HTTP 클라이언트: 2026년 기준

조사 결과 (npm 다운로드 수치는 검증하지 못했다):

- **전역 `fetch`가 기본 권장**이라는 2026년 가이드가 여러 곳이다. 재시도/타임아웃이 필요하면 `ky`, 인터셉터나 구형 환경 지원이 필요하면 `axios`가 보조 선택지로 소개된다.
- **Expo SDK 56부터 전역 `fetch`가 `expo/fetch`다.** (Expo SDK 56 changelog, SDK 58 문서에서 확인: iOS/Android에서 `expo/fetch`가 전역 `fetch`. 끄려면 `EXPO_PUBLIC_USE_RN_FETCH=1`.) WinterTC 호환이며 `AbortSignal.timeout`, `AbortSignal.any`를 지원한다.
- axios는 React Native에서 `fetch`가 아니라 `XMLHttpRequest`를 쓴다는 블로그 한 곳의 설명이 있다 (검증 안 됨).
- **OkHttp**는 React Native의 Android 네트워킹이 내부적으로 쓰는 네이티브 라이브러리라는 것이 일반 지식이다 (이 세션에서 확인하지 못함). JS에서 고르는 대상이 아니다.
- axios의 주된 장점은 인터셉터인데, 이 앱에 필요한 것은 몇 가지뿐이다: `Authorization` 헤더 부착, 응답 헤더 토큰 교체(슬라이딩), 401 → 로그아웃, 오류 정규화(RFC 9457 → 앱 오류 타입). 재시도/캐시는 TanStack Query가 맡는다.

**결정(사용자): 전역 `fetch`로 진행.** `shared/api/client.ts`에 얇은 래퍼를 둔다. 의존성 추가 없음.

## 4. 참고

- RFC 9457: https://www.rfc-editor.org/rfc/rfc9457.html
- Expo SDK 56 changelog / SDK 58 `expo` 문서의 fetch 항목

## 5. 점검 중(maintenance) 응답

로그인 시 서버가 "점검 중"을 알려야 하는 경우가 있다 (전체 점검 + 특정 사용자 타입만 점검).

**조사 결과** (문서/커뮤니티 수준, 여러 곳에서 같은 패턴)
- 점검은 **`503 Service Unavailable` + `Retry-After` 헤더 + JSON 본문(시작/종료 시각)** 으로 내려 일반 오류와 구분한다 (Infor API Gateway 문서). `Retry-After`는 초 또는 HTTP-date.
- `Retry-After`가 없으면 클라이언트는 일반 500처럼 취급한다 (TBC Bank 문서).
- 점검을 5xx로 보는 것이 맞는지에 대한 논쟁이 있다 (Drupal 이슈: 점검은 서버 오류가 아니라 관리자의 선택). 그래도 `503` + `Retry-After`가 가장 널리 쓰인다.
- **사용자 그룹별 점검 응답을 다룬 자료는 찾지 못했다.** 아래는 이 앱 요구에 맞춘 설계 제안이다.

**설계 제안**
- status `503`, `Retry-After`(있으면), 본문은 RFC 9457 형태 + 구조화 필드:

```json
{ "type": "…/maintenance", "status": 503, "code": "MAINTENANCE",
  "scope": "ALL | USER_TYPE", "startAt": "2026-10-26T01:00:00+09:00", "endAt": "2026-10-26T03:00:00+09:00" }
```
- 앱은 **문장이 아니라 시각을 받아** 앱 언어(ko/en)로 포맷해 점검 화면을 보여준다 (`errors.MAINTENANCE` + 기간). 서버가 준 문장을 그대로 쓰지 않는다.
- **사용자 타입별 점검은 비밀번호 검증 이후에 판단하도록 서버에 요청한다.** 타입을 알려면 계정을 먼저 조회해야 하는데, 비밀번호 확인 전에 "이 ID는 ○○ 타입이라 점검 중"이라고 답하면 ID로 계정 타입을 추측할 수 있다 (일반 보안 판단, 출처 없음). 전체 점검(`scope: ALL`)은 인증 전에도 내려도 된다.
- 점검 응답에서는 자동 재시도하지 않는다. 점검 화면 + 확인 버튼. 로그인 이후 점검이 시작돼 API가 `MAINTENANCE`를 주면 점검 화면으로 보내고 로그아웃할지는 정책 결정.
- CDN/게이트웨이가 JSON이 아닌 503 HTML을 줄 수 있다 → 본문 파싱에 실패한 503은 일반 "서비스 이용 불가" 오류로 처리한다.

## 6. 오류 코드 초안 (서버와 합의 필요, 값/상태는 제안)

| code | status | 의미 | 앱 동작 |
| --- | --- | --- | --- |
| `INVALID_CREDENTIALS` | 401 | ID/비밀번호 불일치 | 입력 오류 문구 (계정 존재 여부는 드러내지 않음) |
| `ACCOUNT_TYPE_NOT_ALLOWED` | 403 | 타입 10 등 로그인 불가 계정 | 이용 불가 안내 |
| `MAINTENANCE` | 503 | 전체/타입별 점검 | 점검 화면(기간 표시) |
| `OTP_INVALID` / `OTP_EXPIRED` | 400 | 인증 코드 오류/만료 | 재입력/재전송 |
| `OTP_LOCKED` / `TOO_MANY_REQUESTS` | 429 | 시도/요청 과다 | 잠금 안내(`Retry-After`) |
| `TOKEN_EXPIRED` | 401 | 토큰 만료 | 로그아웃 + 로그인 화면 |

## 7. `fetch`로 헤더 부착과 응답 헤더 토큰 저장이 되나

된다. 둘 다 Fetch 표준 API다 (`Headers`, `Response.headers.get`). Expo 문서가 `expo/fetch`를 WinterTC 호환 Fetch API로 설명한다. 아래는 설계 스케치이고, **기기/시뮬레이터에서 실행해 보지는 않았다.**

```ts
// shared/api/client.ts (설계. 서버 계약 확정 후 구현)
export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getAccessToken();                       // 메모리 저장소 (React 밖에서도 접근)
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(15_000), // SDK 56+ expo/fetch 지원
  });

  const refreshed = response.headers.get('Access-Token');       // 이름은 backend-contract/conventions.md
  if (refreshed) setAccessToken(refreshed);                     // 슬라이딩 만료: 메모리 토큰 교체

  if (!response.ok) throw await toApiError(response);           // 401이면 signOut() + 캐시 비우기
  return response;
}
```

- 헤더 이름은 대소문자를 구분하지 않는다. 같은 이름 헤더가 여러 개면 `get`은 합쳐서 돌려준다.
- 토큰 저장소는 React 밖에서 읽고 써야 하므로 컴포넌트 상태(Context)가 아니라 **비영속 메모리 store**(zustand vanilla store 또는 모듈 변수)여야 한다. 현재 `SessionProvider`(Context)는 API 클라이언트 구현 시 이 구조로 바꾼다.
- 새 토큰 응답 헤더 이름은 `Access-Token`으로 제안했고(`docs/backend-contract/conventions.md`, 표준 없는 커스텀 헤더, `X-` 접두 회피), 값은 `Bearer` 없이 JWT 문자열만을 제안한다. 서버와 합의 전이다.
