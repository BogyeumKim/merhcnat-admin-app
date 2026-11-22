import { z } from 'zod';

import { isUserType, type UserType } from './user-type';

export const challengeMethodSchema = z.enum(['TOTP', 'SMS', 'EMAIL', 'KAKAO']);

/** 인증 수단 하나와, 서버가 이미 마스킹한 수신처(`010-****-0000`, `te****@example.com`). TOTP는 수신처가 없다. */
const challengeOptionSchema = z.object({ method: challengeMethodSchema, destination: z.string().optional() });

/**
 * 서버 `channels`: 예전 형식(문자열 배열)과 새 형식(`{ channel, destination }` 배열)을 모두 받는다.
 * 서버는 user의 휴대폰 컬럼이 비어 있지 않으면 KAKAO·SMS, 이메일 컬럼이 비어 있지 않으면 EMAIL만 내려준다(앱은 거르지 않는다).
 */
const serverChannelsSchema = z.array(
  z.union([
    challengeMethodSchema.transform((method) => ({ method })),
    z.looseObject({ channel: challengeMethodSchema, destination: z.string().optional() }).transform(({ channel, destination }) => ({
      method: channel,
      destination,
    })),
  ]),
);
export const deviceStateSchema = z.enum(['NONE', 'MATCH', 'CHANGED']);

const userTypeSchema = z.custom<UserType>(isUserType, { message: 'Unsupported user type' });

/** 로그인 완료: 액세스 토큰이 메모리에 있고 계정 유형을 알고 있다. */
export const authenticatedSchema = z.object({
  status: z.literal('AUTHENTICATED'),
  userType: userTypeSchema,
  /** 비밀번호가 서버 기한(90일)을 넘음: 다른 무엇보다 먼저 변경해야 한다. */
  passwordChangeRequired: z.boolean(),
  /** "나중에" 허용 여부. 서버는 현재 불허하지만, 정책 변경 시 릴리스가 필요 없도록 앱이 필드를 읽는다. */
  passwordChangeSkippable: z.boolean(),
  /** 서버가 확인한 로그인 아이디(`data.userId`). 비밀번호 규칙 힌트에만 쓰며 메모리에만 둔다. 없으면 입력한 값으로 대신한다. */
  userId: z.string().optional(),
});

/** 로그인 완료 시 추가되는 비밀번호 경과 필드(없으면 변경 불필요). */
const passwordAgeFields = {
  /** 계약상 성공 `data`에 함께 온다. 로그·화면 출력 없이 세션 메모리에만 둔다. */
  userId: z.string().min(1).optional(),
  passwordChangeRequired: z.boolean().optional(),
  passwordChangeSkippable: z.boolean().optional(),
};

/**
 * 비밀번호는 통과했지만 일회용 코드가 아직 필요하다. 아직 토큰은 없다.
 * `loginType` 0 = 인증 앱(TOTP), 1 = 메시지 코드(KAKAO / SMS / EMAIL)이며 사용자가 `methods` 중에서 고른다.
 */
export const challengeRequiredSchema = z.object({
  status: z.literal('CHALLENGE_REQUIRED'),
  loginType: z.union([z.literal(0), z.literal(1)]),
  /** `NONE` / `CHANGED`: 새 기기 안내를 먼저 보여준다. */
  deviceState: deviceStateSchema,
  /** 비어 있으면 연락처가 하나도 없는 계정: 인증 시트가 "등록된 연락처가 없어요"를 보여준다. */
  methods: z.array(challengeOptionSchema),
  /** 이 사용자가 마지막으로 인증에 성공한 수단("최근 사용" 배지). 이력이 없으면 없다. */
  recentMethod: challengeMethodSchema.optional(),
  /** 본인의 다른 기기가 등록돼 있을 때만: 서버가 마스킹한 본인 아이디. 다른 계정 기기면 오지 않는다. */
  registeredUserIdMasked: z.string().optional(),
  /** 이 기기가 다른 계정에 등록돼 있음(누구인지는 알려주지 않는다). */
  deviceRegisteredToOtherAccount: z.boolean().optional(),
  /** 서버가 아닌 앱이 설정: 사용자가 방금 입력한 ID(메모리 전용, 기기 변경 안내에 표시). */
  enteredUserId: z.string().optional(),
});

/**
 * `POST /api/auth/login`의 `data`. 200 `SUCCESS` = 로그인 완료(`Access-Token` 헤더 설정, 등록된 기기이며
 * 메시지 코드 계정). `MFA_REQUIRED`(현재 401, 이전 202) = 비밀번호는 통과했으나 코드가 아직 필요: `channels`와
 * 코드 호출이 보내는 `challengeToken`을 담는다. 로그인이 아니며, status가 아니라 `code`로 구분한다.
 */
export const serverLoginDataSchema = z.looseObject({
  loginType: z.union([z.literal(0), z.literal(1)]),
  userType: userTypeSchema,
  deviceState: deviceStateSchema,
  channels: serverChannelsSchema.optional(),
  lastUsedChannel: challengeMethodSchema.optional(),
  challengeToken: z.string().min(1).optional(),
  registeredUserIdMasked: z.string().optional(),
  deviceRegisteredToOtherAccount: z.boolean().optional(),
  deviceSecret: z.string().min(1).optional(),
  ...passwordAgeFields,
});

/** `PASSWORD_CHANGE_REQUIRED`(현재 403, 이전 202)의 `data`(로그인·코드 검증 공통): 토큰 헤더는 없다. */
export const serverTempPasswordDataSchema = z.looseObject({
  challengeToken: z.string().min(1),
  userId: z.string().min(1).optional(),
  /** 같은 변경 흐름의 사유(문구만 다름). 없으면 임시비밀번호. */
  reason: z.enum(['TEMP_PASSWORD', 'PASSWORD_EXPIRED']).optional(),
});

/** `POST /api/auth/otp/send`의 `data`. 서버가 마스킹한 수신처가 앱이 보는 유일한 값이다(`maskedPhone`은 이전 이름). */
export const serverSendCodeDataSchema = z.looseObject({
  expiresInSeconds: z.number().positive(),
  resendAfterSeconds: z.number().nonnegative(),
  maskedDestination: z.string().optional(),
  maskedPhone: z.string().optional(),
  /** 이 challenge에서 남은 발송 횟수(선택). 형식이 어긋나도 발송 성공을 막지 않도록 무시한다. */
  remainingSends: z.number().int().nonnegative().optional().catch(undefined),
});

/**
 * `POST /api/auth/otp/verify`의 `data`. `userType`만 읽는다. 액세스 토큰은 본문이 아니라
 * `Access-Token` 응답 헤더로 온다(`shared/api/client.ts` 참고).
 */
export const serverVerifyDataSchema = z.looseObject({
  userType: userTypeSchema,
  /** 이 기기를 등록했을 때만 한 번 온다: SecureStore에 보관(`device-secret`). */
  deviceSecret: z.string().min(1).optional(),
  ...passwordAgeFields,
});

export type ChallengeMethod = z.infer<typeof challengeMethodSchema>;
export type ChallengeOption = z.infer<typeof challengeOptionSchema>;
export type DeviceState = z.infer<typeof deviceStateSchema>;
export type Authenticated = z.infer<typeof authenticatedSchema>;
export type ChallengeRequired = z.infer<typeof challengeRequiredSchema>;
/** 임시비밀번호 계정: 새 비밀번호를 등록하기 전에는 토큰이 없고 홈으로 갈 수 없다. */
export type TempPasswordRequired = { status: 'TEMP_PASSWORD_REQUIRED'; reason?: 'TEMP_PASSWORD' | 'PASSWORD_EXPIRED' };
export type LoginResult = Authenticated | ChallengeRequired | TempPasswordRequired;
/** API가 mutation에 넘기는 값: challenge 토큰은 거기서 분리해 메모리(`challenge-vault`, `temp-password-vault`)에 보관한다. */
export type TempPasswordApiResult = TempPasswordRequired & { challengeToken: string; userId?: string };
export type LoginApiResult = Authenticated | (ChallengeRequired & { challengeToken: string }) | TempPasswordApiResult;
export type VerifyApiResult = Authenticated | TempPasswordApiResult;
export type VerifyResult = Authenticated | TempPasswordRequired;
export type SendCodeResult = {
  expiresInSeconds: number;
  resendAfterSeconds: number;
  /** 서버가 알려준 경우, 코드를 보낸 마스킹된 수신처(전화번호 또는 이메일). */
  destination?: string;
  /** 서버가 알려준 경우, 이 challenge에서 남은 발송 횟수. 화면에는 아직 쓰지 않는다. */
  remainingSends?: number;
};
