import { z } from 'zod';

import { isUserType, type UserType } from './user-type';

export const challengeMethodSchema = z.enum(['TOTP', 'SMS', 'EMAIL', 'KAKAO']);
export const deviceStateSchema = z.enum(['NONE', 'MATCH', 'CHANGED']);

const userTypeSchema = z.custom<UserType>(isUserType, { message: 'Unsupported user type' });

/** The login finished: the access token is in memory and the account type is known. */
export const authenticatedSchema = z.object({
  status: z.literal('AUTHENTICATED'),
  userType: userTypeSchema,
  /** The password is older than the server's limit (90 days): it has to be changed before anything else. */
  passwordChangeRequired: z.boolean(),
  /** Whether "later" is allowed. The server says no for now; the app reads the field so a policy change needs no release. */
  passwordChangeSkippable: z.boolean(),
});

/** The password-age fields a completed login adds (absent = no change needed). */
const passwordAgeFields = {
  passwordChangeRequired: z.boolean().optional(),
  passwordChangeSkippable: z.boolean().optional(),
};

/**
 * The password was accepted, but a one-time code is still needed. There is no token yet.
 * `loginType` 0 = authenticator app (TOTP), 1 = message code (KAKAO / SMS), chosen by the user from `methods`.
 */
export const challengeRequiredSchema = z.object({
  status: z.literal('CHALLENGE_REQUIRED'),
  loginType: z.union([z.literal(0), z.literal(1)]),
  /** `NONE` / `CHANGED`: show the new-device notice first. */
  deviceState: deviceStateSchema,
  methods: z.array(z.object({ method: challengeMethodSchema })).min(1),
});

/**
 * `data` of `POST /api/auth/login`. HTTP 200 `SUCCESS` = signed in (the `Access-Token` header is set, a registered device
 * with a message-code account). HTTP 202 `MFA_REQUIRED` = the password was accepted but a code is still needed: it
 * carries `channels` and the `challengeToken` the code calls send. A 202 is NOT a sign-in.
 */
export const serverLoginDataSchema = z.looseObject({
  loginType: z.union([z.literal(0), z.literal(1)]),
  userType: userTypeSchema,
  deviceState: deviceStateSchema,
  channels: z.array(challengeMethodSchema).optional(),
  challengeToken: z.string().min(1).optional(),
  ...passwordAgeFields,
});

/** `data` of `POST /api/auth/otp/send`. The masked phone is the only destination the app ever sees. */
export const serverSendCodeDataSchema = z.looseObject({
  expiresInSeconds: z.number().positive(),
  resendAfterSeconds: z.number().nonnegative(),
  maskedPhone: z.string().optional(),
});

/**
 * `data` of `POST /api/auth/otp/verify`. Only `userType` is read. The access token is NOT in the body: it comes in the
 * `Access-Token` response header (see `shared/api/client.ts`).
 */
export const serverVerifyDataSchema = z.looseObject({ userType: userTypeSchema, ...passwordAgeFields });

export type ChallengeMethod = z.infer<typeof challengeMethodSchema>;
export type DeviceState = z.infer<typeof deviceStateSchema>;
export type Authenticated = z.infer<typeof authenticatedSchema>;
export type ChallengeRequired = z.infer<typeof challengeRequiredSchema>;
export type LoginResult = Authenticated | ChallengeRequired;
/** What the login API hands to the mutation: the challenge token is split off there and kept in memory (`challenge-vault`). */
export type LoginApiResult = Authenticated | (ChallengeRequired & { challengeToken: string });
export type SendCodeResult = {
  expiresInSeconds: number;
  resendAfterSeconds: number;
  /** Masked phone number the code was sent to, when the server reports it. */
  destination?: string;
};
