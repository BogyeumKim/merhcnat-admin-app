import { z } from 'zod';

import { validationCode } from '@/shared/forms/validation';

export const CODE_LENGTH = 6;

/** 서버 길이 상한(넘으면 400 BAD_REQUEST). 로그인·비밀번호 변경 입력란의 `maxLength`로 막는다(네이티브가 붙여넣기도 자른다). */
export const USER_ID_MAX_LENGTH = 30;
export const PASSWORD_MAX_LENGTH = 64;

/** 메시지는 검증 코드이며 UI에서 번역한다(`validation.<code>`). */
export const loginSchema = z.object({
  userId: z.string().trim().min(1, validationCode('USER_ID_REQUIRED')),
  password: z.string().min(1, validationCode('PASSWORD_REQUIRED')),
});

export const codeSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), validationCode('CODE_INVALID_FORMAT')),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type CodeValues = z.infer<typeof codeSchema>;

/** 비밀번호 변경: 모든 필드를 채워야 하며, 규칙 검사와 "두 번 동일" 검사는 훅의 힌트이고 최종 판단은 서버가 한다. */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, validationCode('PASSWORD_REQUIRED')),
  newPassword: z.string().min(1, validationCode('PASSWORD_REQUIRED')),
  confirmPassword: z.string().min(1, validationCode('PASSWORD_REQUIRED')),
});

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;
