import type { DeviceInfo } from '../model/device-info';
import type { Authenticated, ChallengeMethod, LoginResult } from '../model/schemas';

export type AuthApi = {
  login(input: { userId: string; password: string; device: DeviceInfo }): Promise<LoginResult>;
  sendCode(input: { challengeId: string; method: ChallengeMethod }): Promise<void>;
  verifyCode(input: { challengeId: string; code: string; confirmDevice: boolean }): Promise<Authenticated>;
  logout(): Promise<void>;
};
