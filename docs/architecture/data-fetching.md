# 데이터 패칭 — TanStack Query 패턴

참고 프로젝트(onebite-log, React 웹)의 구조를 탭/도메인별 모듈(feature-first) + React Native에 맞게 옮긴 것.

## 핵심: UI와 서비스 로직 분리

| 담당 | 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| UI 컴포넌트 | toast, 화면 이동, 모달/시트 닫기, 확인 다이얼로그 → `UseMutationCallback`으로 전달 | `queryClient` 접근 |
| mutation/query 훅 | `useMutation`, 캐시 갱신, 낙관적 업데이트/롤백, 콜백 호출 | toast, router, UI import |

## 원본 패턴 (onebite-log)

```ts
// types.ts
export type UseMutationCallback = {
  onSuccess?: () => void; onError?: (error: Error) => void;
  onMutate?: () => void;  onSettled?: () => void;
};

// hooks/mutations/post/use-delete-post.ts  (서비스 쪽)
export function useDeletePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (deleted) => { /* 캐시 갱신 */ callbacks?.onSuccess?.(); },
    onError: (error) => callbacks?.onError?.(error),
  });
}

// components/post/delete-post-button.tsx  (UI 쪽)
const { mutate: deletePost, isPending } = useDeletePost({
  onSuccess: () => navigate('/', { replace: true }),
  onError: () => toast.error('포스트 삭제에 실패했습니다'),
});
```

- 쿼리 키는 `QUERY_KEYS` 객체로 중앙 관리.
- 목록 쿼리는 id 배열만 캐시하고, 각 항목은 `byId` 키로 정규화(`setQueryData`로 시딩).
- 삭제는 목록 id 배열과 byId 캐시를 함께 정리, 좋아요 같은 토글은 낙관적 업데이트 + 롤백.

> 구현 시 `UseMutationCallback`에 결과 타입(`onSuccess(data)`)과 `ApiError` 오류 타입을 추가했다 (로그인 결과로 화면 이동을 결정해야 해서). 아래 표는 변경 이유 기록이다.

## 이 프로젝트에서의 변경점

| 원본 | 변경 | 이유 |
| --- | --- | --- |
| `if (callbacks?.onSuccess) callbacks.onSuccess()` | `callbacks?.onSuccess?.()` | 동일 동작, 간결 |
| 콜백 호출 후 캐시 갱신 (delete 훅) | 캐시 갱신 후 콜백 호출 | UI 콜백이 갱신된 캐시를 보게 함 |
| `setQueryData` updater 안 `throw` | 이전 값 반환 | 렌더 중 예외 방지 |
| `session!.user.id` | 인자로 전달/타입 있는 에러 | non-null 단언 제거 |
| `refetchOnWindowFocus: false` | `focusManager` + AppState 연결 | RN에는 window focus가 없음 |
| `toast`(sonner), `navigate`(react-router) | UI에서 toast 라이브러리, `expo-router`의 `router` | 플랫폼 차이 |

## 폴더 배치 (feature-first)

```
features/users/
  api/get-users.ts                    # 원시 요청 함수
  queries/query-keys.ts               # userKeys.byId(id) ...
  queries/use-users-data.ts
  mutations/use-update-user.ts        # (callbacks?: UseMutationCallback)
  components/update-user-button.tsx   # toast/이동은 여기서 콜백으로
  screens/users-screen.tsx
  index.ts
shared/api/
  client.ts, types.ts                 # UseMutationCallback (구현됨)
core/providers/query-provider.tsx     # QueryClient 기본값, focusManager/onlineManager
```

## 미정 (결정 필요)

- API 클라이언트(fetch/axios), 인증 방식, 에러 정규화 방식.
- 쿼리 캐시 persistence(MMKV 등) 도입 여부.
