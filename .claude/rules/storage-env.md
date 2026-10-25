---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "app.json"
---

# 저장소 / 환경변수 규칙

근거와 조사 내용: `docs/architecture/storage-env-testing.md`

## 저장소 (용도별로 나눈다)

| 데이터 | 사용 | 위치 |
| --- | --- | --- |
| 기기 ID(iOS 키체인), 비밀 값 | `expo-secure-store` | 기기 값(`deviceId`)은 `features/auth/model/device-id`. **로그인 토큰은 저장하지 않는다** (메모리 전용, `auth-jwt.md`) |
| 앱 설정(언어 등 작은 값), 렌더 전에 읽어야 하는 값 | `expo-sqlite/kv-store` (동기 API) | `shared/lib/storage` — 키는 `STORAGE_KEYS`에만 추가 |
| 구조화/대량/오프라인 데이터 | `expo-sqlite` (필요해질 때) | 해당 feature의 `api/` |

- 로그인 토큰은 어디에도 영속 저장하지 않는다. 토큰이나 개인정보를 `shared/lib/storage`(암호화되지 않음)에 저장하지 않는다.
- **TanStack Query 캐시를 디스크에 persist하지 않는다** (결제/정산 데이터가 평문으로 남음). 필요하면 `shouldDehydrateQuery`로 비민감 쿼리만 골라 별도 결정 후 도입한다.

## 환경변수

- 클라이언트 번들에 들어가는 `EXPO_PUBLIC_*`에는 비밀 값을 넣지 않는다 (앱을 실행하는 누구나 읽을 수 있다).
- `process.env.EXPO_PUBLIC_X`처럼 **정적으로** 참조한다. `process.env[name]`, 구조분해(`const { EXPO_PUBLIC_X } = process.env`)는 치환되지 않아 `undefined`가 된다.
- 환경변수는 `src/shared/config/env.ts`에서 `zod`로 한 번 검증하고(누락 시 시작 시점에 명확한 에러, 구현됨), 앱 코드는 이 모듈만 import한다. 새 변수를 추가하면 스키마와 `.env.example`에 함께 추가한다. `.env.development`는 커밋하되 비밀 값을 넣지 않는다.
- SDK 58: `NODE_ENV`는 명령이 정한다. `.env.development` / `.env.production`만 로드되며 `.env.staging` 같은 파일은 로드되지 않는다. `.env*.local`은 git에 올리지 않는다.
