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
- `focusManager`는 `AppState`와 연결돼 있다 (`onlineManager`는 NetInfo 도입 시).
