import { z } from 'zod';

import { isUserType, type UserType } from './user-type';

export const challengeMethodSchema = z.enum(['TOTP', 'SMS', 'EMAIL', 'KAKAO']);
export const deviceStateSchema = z.enum(['NONE', 'MATCH', 'CHANGED']);

const userTypeSchema = z.custom<UserType>(isUserType, { message: 'Unsupported user type' });

export const authenticatedSchema = z.object({
  status: z.literal('AUTHENTICATED'),
  userType: userTypeSchema,
});

export const challengeRequiredSchema = z.object({
  status: z.literal('CHALLENGE_REQUIRED'),
  challengeId: z.string().min(1),
  deviceState: deviceStateSchema,
  /** Delivery options. `destination` is masked by the server (the app never sees or sends the real address). */
  methods: z.array(z.object({ method: challengeMethodSchema, destination: z.string().optional() })).min(1),
});

export const loginResultSchema = z.discriminatedUnion('status', [authenticatedSchema, challengeRequiredSchema]);

export type ChallengeMethod = z.infer<typeof challengeMethodSchema>;
export type DeviceState = z.infer<typeof deviceStateSchema>;
export type Authenticated = z.infer<typeof authenticatedSchema>;
export type ChallengeRequired = z.infer<typeof challengeRequiredSchema>;
export type LoginResult = z.infer<typeof loginResultSchema>;
