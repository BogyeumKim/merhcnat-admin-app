import type { FieldError } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';

/** Machine codes used as zod messages; translated through `validation.<code>` in the locale files. */
export const VALIDATION_CODES = ['USER_ID_REQUIRED', 'PASSWORD_REQUIRED', 'CODE_INVALID_FORMAT'] as const;
export type ValidationCode = (typeof VALIDATION_CODES)[number];

/** Identity helper so schemas can only use known codes. */
export const validationCode = (code: ValidationCode): ValidationCode => code;

const isValidationCode = (value: unknown): value is ValidationCode => VALIDATION_CODES.some((code) => code === value);

/** Returns a function that turns a react-hook-form field error into translated text (or `null`). */
export function useValidationMessage() {
  const { t } = useTranslation();

  return (error: FieldError | undefined): string | null => {
    if (!error) return null;
    return isValidationCode(error.message) ? t(`validation.${error.message}`) : t('errors.UNKNOWN');
  };
}
