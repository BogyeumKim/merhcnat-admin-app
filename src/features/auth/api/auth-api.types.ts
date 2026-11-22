import type { DeviceInfo } from '../model/device-info';
import type { ChallengeMethod, LoginApiResult, SendCodeResult, VerifyApiResult } from '../model/schemas';

export type AuthApi = {
  /** 비밀번호는 여기서만 전송한다. 이후 코드 호출은 이 응답의 `challengeToken`을 사용한다. */
  login(input: { userId: string; password: string; device: DeviceInfo }): Promise<LoginApiResult>;
  sendCode(input: { challengeToken: string; channel: ChallengeMethod }): Promise<SendCodeResult>;
  verifyCode(input: { challengeToken: string; channel: ChallengeMethod; code: string }): Promise<VerifyApiResult>;
};
