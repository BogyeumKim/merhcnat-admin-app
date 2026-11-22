import type { FieldError } from 'react-hook-form';

import { useTranslation } from '@/shared/i18n';

/** zod 메시지로 쓰는 머신 코드. 로케일 파일의 `validation.<code>`로 번역한다. */
export const VALIDATION_CODES = ['USER_ID_REQUIRED', 'PASSWORD_REQUIRED', 'CODE_INVALID_FORMAT'] as const;
export type ValidationCode = (typeof VALIDATION_CODES)[number];

/** 스키마가 알려진 코드만 쓰도록 하는 항등 헬퍼. */
export const validationCode = (code: ValidationCode): ValidationCode => code;

const isValidationCode = (value: unknown): value is ValidationCode => VALIDATION_CODES.some((code) => code === value);

/** react-hook-form 필드 오류를 번역된 텍스트(또는 `null`)로 바꾸는 함수를 반환한다. */
export function useValidationMessage() {
  const { t } = useTranslation();

  return (error: FieldError | undefined): string | null => {
    if (!error) return null;
    return isValidationCode(error.message) ? t(`validation.${error.message}`) : t('errors.UNKNOWN');
  };
}
