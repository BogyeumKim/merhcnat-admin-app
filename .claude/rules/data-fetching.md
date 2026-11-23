---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# 서버 상태 / TanStack Query 규칙

상세 설명과 예제: `docs/architecture/data-fetching.md` (onebite-log 프로젝트의 패턴 기반)

## 역할 분리 (핵심)

- **UI(메인 컴포넌트)**: toast, 화면 이동(`router`), 모달 닫기, 시트 열기 등 *화면 관련* 동작. mutation 훅에 `UseMutationCallback`으로 넘긴다.
- **서비스 훅(`queries/`, `mutations/`)**: `useMutation`/`useQuery`, 캐시 갱신(`setQueryData`/`resetQueries`/`removeQueries`), 낙관적 업데이트·롤백. toast/router/UI import 금지.
- UI 컴포넌트는 `queryClient`를 직접 만지지 않는다.

```ts
// shared/api/types.ts (구현됨). onebite-log 원형에서 결과 타입과 오류 타입을 확장
export type UseMutationCallback<TData = void> = {
  onMutate?: () => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
};
```

## 파일 배치 (feature 안)

- 원시 요청 함수: `features/<f>/api/*.ts` (훅/React 의존 없음). 공용 client는 `shared/api/`.
- 쿼리 키: `features/<f>/queries/query-keys.ts`에서 객체로 관리. 문자열 배열을 컴포넌트에 직접 쓰지 않는다.
- 조회 훅: `features/<f>/queries/use-<name>-data.ts`
- 변경 훅: `features/<f>/mutations/use-<verb>-<noun>.ts` — 시그니처 `(callbacks?: UseMutationCallback)`
- 변경을 트리거하는 UI: `features/<f>/components/` 또는 `screens/` (toast/이동은 여기서 콜백으로)
- `UseMutationCallback` 타입: `shared/api/types.ts`

## 구현 규칙

- 목록 쿼리는 id 배열만 저장하고, 각 항목은 `byId` 키로 정규화해 `setQueryData`로 시딩한다. 삭제/수정은 byId 캐시와 목록 id 배열을 함께 갱신한다.
- 훅 안에서는 **캐시 갱신 후** `callbacks?.onSuccess?.()`를 호출한다 (UI 콜백이 일관된 캐시를 보도록).
- `setQueryData` updater 안에서 `throw`하지 않는다. 대상이 없으면 이전 값을 그대로 반환한다.
- 세션/사용자 값에 non-null 단언(`!`)을 쓰지 않는다. 훅 인자로 받거나 타입 있는 에러를 던진다.
- 낙관적 업데이트: `onMutate`에서 `cancelQueries` → 이전 값 저장 → 갱신, `onError`에서 롤백.
- 무한 목록은 `useInfiniteQuery` + `FlatList`/`FlashList`의 `onEndReached`.
- `staleTime`은 쿼리별로 의도를 가지고 설정한다 (기본값에 의존하지 않는다).
- React Native 전용: 포커스 복귀 refetch는 `focusManager`(AppState), 네트워크 상태는 `onlineManager`(NetInfo 또는 expo-network)와 연결한다. `refetchOnWindowFocus`는 RN에서 동작하지 않는다.
- 패키지 설치: `npx expo install @tanstack/react-query`.

## 이 프로젝트의 구현 규칙 (구현됨)

- mutation 훅은 `onError`에서 `asApiError(error)`로 항상 `ApiError`를 UI에 넘긴다. UI는 `error.code`를 `errors.<code>`로 번역한다.
- 비밀번호처럼 민감한 변수를 받는 mutation은 `gcTime: 0`.
- 전역 `fetch` 래퍼(`shared/api/client.ts`)만 네트워크를 호출한다. `axios`를 쓰지 않는다 (expo-data-fetching skill 권장과 사용자 결정).
- 로그아웃 시 `QueryClient.clear()`는 `core/providers/query-provider.tsx`가 `registerSignOutHandler`로 등록한다 (feature가 core를 import하지 않도록).
- 쿼리/뮤테이션 오류 타입은 `Register { defaultError: ApiError }`(`core/providers/query-provider.tsx`)로 고정돼 `error as ApiError` 캐스트가 필요 없다. 런타임 경계(`onError` 콜백 등)에서는 여전히 `asApiError`로 좁힌다.
- 쿼리·mutation의 최종 실패는 `QueryCache`/`MutationCache` `onError`에서 차단 오류(점검 등)를 화면으로 보낸다(`routeBlockingError` 한 곳, `feedback-ux.md`).
- `focusManager`는 `AppState`와 연결돼 있다 (`onlineManager`는 NetInfo 도입 시).
- `shared/api/client.ts`: 15초 타임아웃은 본문 읽기까지 포함(`TIMEOUT`), 오류 envelope의 `data: null` 허용(서버 `code` 유지), 성공(200)은 envelope 없는 DTO 본문을 `apiJson(path, schema)`로 검증하고(200 외 2xx·스키마 불일치는 `INVALID_RESPONSE`), 일반 응답은 토큰을 읽지 않는다. 토큰 발급 엔드포인트만 `apiTokenJson`(본문 `accessToken`, 헤더 폴백 없음)을 쓰고, 응답 수락 뒤 적용 직전에 세션 generation을 다시 확인한다(로그아웃 뒤 토큰 부활 방지).

## 연타(따닥) 방지 (구현됨)

버튼의 `disabled={isPending}`만으로는 부족하다: `isPending`은 다시 렌더링된 뒤에야 바뀌어 그 전에 들어온 두 번째 탭/Enter가 통과한다. 동기 잠금을 쓴다. 두 가지뿐이다.

- **네트워크 작업(mutation, 수동 `refetch`)**: `useRunOnce()`(`shared/lib/use-run-once`). `runOnce((done) => mutation.mutate(vars, { onSettled: done }))`. 한 화면/흐름의 요청들은 러너 하나를 같이 쓴다(인증 흐름은 발송·검증·기기 확인이 한 잠금). 화면을 떠나는 성공은 이동을 시작한 뒤에 풀거나(로그인: `openSheet` 완료 후) 아예 풀지 않는다(비밀번호 변경: 실패만 `done`). `refetch()`는 기본값이 진행 중 요청을 취소하고 새로 보내므로 반드시 감싼다.
- **사용자 탭으로 시작하는 이동(push/back/replace/로그아웃)**: `navigateOnce(() => router.push(...))`(`shared/lib/navigation-lock`, 앱 전체 600ms 잠금). `back()` 연타는 아래 화면까지 닫는다. 시트는 `openSheet`(블러 대기 + 같은 잠금). 서버 응답이 정하는 이동(오류 화면, 라우트 가드)은 감싸지 않는다.
- 단계가 바뀌며 같은 자리에 다른 버튼이 나타나면(기기 "변경" → 이메일 "인증번호 받기") 단계 전환도 같은 러너로 잠깐(`STEP_SETTLE_MS`) 잠근다.
- 자동 제출(인증번호 6자리)은 값이 바뀐 경우에만 알린다(`use-otp-code-field`): 7번째 입력이 같은 코드를 다시 보내지 않게.
- 새 버튼/행/링크가 요청이나 이동을 시작하면 위 둘 중 하나를 반드시 거친다. 로컬 상태만 바꾸는 탭(펼치기, 금액 숨기기, 지우기)은 필요 없다.

