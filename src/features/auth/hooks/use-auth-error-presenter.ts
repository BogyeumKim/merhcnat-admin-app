import { router } from 'expo-router';

import { maintenanceHref } from '@/features/maintenance';
import { presentationOf } from '@/shared/api/error-presentation';
import type { ApiError } from '@/shared/api/errors';
import { useTranslation } from '@/shared/i18n';
import { showErrorToast } from '@/shared/ui/toast';

type AuthErrorHandlers = {
  /** A persistent error shown inside the screen (form alert, field error). */
  onInline: (error: ApiError) => void;
  /** The account is locked until an administrator unlocks it: the flow ends, so the screen can clean up first. */
  onLocked?: () => void;
};

/**
 * Where a failure of an authentication step is shown depends on its kind (`presentationOf`): maintenance and locked
 * accounts have their own screens, transient errors are toasts (one id per code, so repeats update one toast), the rest
 * stays inline. Screens only say what "inline" means for them.
 */
export function useAuthErrorPresenter({ onInline, onLocked }: AuthErrorHandlers) {
  const { t } = useTranslation();

  return (error: ApiError) => {
    switch (presentationOf(error.code)) {
      case 'maintenance':
        router.push(maintenanceHref(error));
        return;
      case 'locked':
        onLocked?.();
        router.push('/account-locked');
        return;
      case 'toast':
        showErrorToast({ id: `error:${error.code}`, title: t(`errors.${error.code}`) });
        return;
      case 'inline':
        onInline(error);
        return;
    }
  };
}
