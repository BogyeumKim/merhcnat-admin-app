import { z } from 'zod';

import { validationCode } from '@/shared/forms/validation';

export const CODE_LENGTH = 6;

/** Messages are validation codes, translated in the UI (`validation.<code>`). */
export const loginSchema = z.object({
  userId: z.string().trim().min(1, validationCode('USER_ID_REQUIRED')),
  password: z.string().min(1, validationCode('PASSWORD_REQUIRED')),
});

export const codeSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), validationCode('CODE_INVALID_FORMAT')),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type CodeValues = z.infer<typeof codeSchema>;
