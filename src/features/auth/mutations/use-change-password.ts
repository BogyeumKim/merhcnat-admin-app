import { useMutation } from '@tanstack/react-query';

import { asApiError } from '@/shared/api/errors';
import type { UseMutationCallback } from '@/shared/api/types';

import { changePassword, type ChangePasswordInput } from '../api/password-api';
import { markPasswordChanged } from '../model/session-store';

/** Changes the password. Success lifts the "change it first" gate; the passwords are never kept (`gcTime: 0`). */
export function useChangePassword(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
    gcTime: 0,
    onMutate: () => callbacks?.onMutate?.(),
    onSuccess: () => {
      markPasswordChanged();
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(asApiError(error)),
    onSettled: () => callbacks?.onSettled?.(),
  });
}
