import type { ApiError } from './errors';

/**
 * mutation에 대한 화면 단위 반응. UI 컴포넌트가 넘기며(내비게이션, 토스트, 포커스), mutation 훅이
 * 상태/캐시를 갱신한 뒤 호출한다. `TData`는 mutation 결과다.
 */
export type UseMutationCallback<TData = void> = {
  onMutate?: () => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
};
