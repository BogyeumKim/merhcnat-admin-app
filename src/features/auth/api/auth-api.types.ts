import type { DeviceInfo } from '../model/device-info';
import type { Authenticated, ChallengeMethod, LoginApiResult, SendCodeResult } from '../model/schemas';

export type AuthApi = {
  /** The password is only ever sent here. The code calls use the `challengeToken` this returns. */
  login(input: { userId: string; password: string; device: DeviceInfo }): Promise<LoginApiResult>;
  sendCode(input: { challengeToken: string; channel: ChallengeMethod }): Promise<SendCodeResult>;
  verifyCode(input: { challengeToken: string; channel: ChallengeMethod; code: string }): Promise<Authenticated>;
  logout(): Promise<void>;
};
