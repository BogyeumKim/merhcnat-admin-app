import type { ApiError } from './errors';

/**
 * Screen-level reactions to a mutation. UI components pass these (navigation, toast, focus); the mutation hook
 * calls them after it has updated its state/cache. `TData` is the mutation result.
 */
export type UseMutationCallback<TData = void> = {
  onMutate?: () => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
};
