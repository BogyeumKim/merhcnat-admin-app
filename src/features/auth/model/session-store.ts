import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { ApiError, type ErrorCode } from '@/shared/api/errors';
import { getAccessToken, setAccessToken, setUnauthorizedHandler } from '@/shared/api/session-token';

import { authFlowActions } from './auth-flow-store';
import { clearTempPasswordToken } from './temp-password-vault';
import type { UserType } from './user-type';

type PasswordChange = { required: boolean; skippable: boolean };

/**
 * 세션이 끝난 이유(로그인 화면 안내 문구를 고른다). `replaced`: 다른 로그인이 이 세션을 대체(`SESSION_REPLACED`),
 * `expired`: 유휴 만료·세션 삭제·유효하지 않은 토큰.
 */
export type SessionEndReason = 'replaced' | 'expired';

type State = {
  userType: UserType | null;
  /** 로그인한 아이디. 비밀번호 변경 규칙("아이디 포함 금지") 힌트 전용이며 로그·화면 출력에 쓰지 않는다. 모르면 `null`. */
  userId: string | null;
  passwordChange: PasswordChange;
  sessionEnded: SessionEndReason | null;
};

const noPasswordChange: PasswordChange = { required: false, skippable: false };
const initialState: State = { userType: null, userId: null, passwordChange: noPasswordChange, sessionEnded: null };

/**
 * 로그인 상태. 액세스 토큰 자체는 여기에 없다: API 클라이언트가 읽고 교체할 수 있도록 `shared/api/session-token`의
 * 메모리에 있다. 이 store의 어떤 값도 저장하지 않는다(`persist` 금지: 아이디도 앱을 끄면 사라진다).
 */
const useSessionStore = create(
  combine(initialState, (set) => ({
    actions: {
      signIn: (userType: UserType, userId: string | null, passwordChange: PasswordChange) =>
        set({ userType, userId, passwordChange, sessionEnded: null }),
      passwordChanged: () => set({ passwordChange: noPasswordChange }),
      /** `ended`: 서버가 세션을 끝낸 이유. 로그아웃과 같은 갱신에서 설정하므로 내비게이터가 두 화면 그룹이 모두 없는 상태를 거치지 않는다. */
      clear: (ended: SessionEndReason | null = null) =>
        set({ userType: null, userId: null, passwordChange: noPasswordChange, sessionEnded: ended }),
      sessionEnded: (ended: SessionEndReason | null) => set({ sessionEnded: ended }),
    },
  })),
);

/** `userType`은 `0`(유효한 유형)일 수 있으므로 로그인 여부는 `!== null`로 판단하고 truthiness를 쓰지 않는다. */
export function useSession() {
  return useSessionStore(
    useShallow((store) => ({ userType: store.userType, isSignedIn: store.userType !== null })),
  );
}

export const useIsSignedIn = () => useSessionStore((store) => store.userType !== null);

/** React 외부 코드용(화면 제거 리스너 등). */
export const isSignedInNow = () => useSessionStore.getState().userType !== null;

/** 서버가 세션을 끝냄(토큰을 실은 요청에 401): 로그인 전에 로그아웃 안내가 먼저 나온다. */
export const useSessionEnded = () => useSessionStore((store) => store.sessionEnded !== null);

/** 안내 문구용 종료 이유(안내가 없으면 `null`). */
export const useSessionEndReason = () => useSessionStore((store) => store.sessionEnded);

/** 안내를 확인함: 로그인 화면으로 이동한다. */
export const acknowledgeSessionEnded = () => useSessionStore.getState().actions.sessionEnded(null);

/** 로그인했지만 서버가 비밀번호 변경을 먼저 요구함(90일 경과). */
export const useMustChangePassword = () =>
  useSessionStore((store) => store.userType !== null && store.passwordChange.required);

/** 로그인한 아이디(모르면 `null`). 비밀번호 규칙 힌트 전용: 로그나 화면에 내보내지 않는다. */
export const useSignedInUserId = () => useSessionStore((store) => store.userId);

export const usePasswordChangeSkippable = () => useSessionStore((store) => store.passwordChange.skippable);

/** 비밀번호를 변경함(또는 허용되는 경우 건너뜀): 메인 화면을 열 수 있다. */
export const markPasswordChanged = () => useSessionStore.getState().actions.passwordChanged();

const signOutHandlers = new Set<() => void>();

/** feature가 외부 레이어를 import하지 않고도 바깥 레이어가 로그아웃에 반응(예: 쿼리 캐시 삭제)하게 한다. */
export function registerSignOutHandler(handler: () => void) {
  signOutHandlers.add(handler);
  return () => signOutHandlers.delete(handler);
}

/** 토큰이 적용되지 않은 `AUTHENTICATED`(예: 응답 도중 로그아웃해 세션 세대가 바뀜)로는 로그인하지 않는다. */
export function assertTokenIssued() {
  if (getAccessToken() === null) throw new ApiError({ status: 200, code: 'INVALID_RESPONSE' });
}

type SignInResult = { userType: UserType; userId?: string; passwordChangeRequired: boolean; passwordChangeSkippable: boolean };

/**
 * 인증이 완전히 성공했을 때 한 번 호출된다(토큰은 이미 메모리에 있음). 아이디는 서버가 준 값을 우선하고,
 * 없으면 사용자가 입력한 값(`enteredUserId`)을 쓴다.
 */
export function completeSignIn(result: SignInResult, enteredUserId: string | null = null) {
  authFlowActions().clear();
  useSessionStore.getState().actions.signIn(result.userType, result.userId ?? enteredUserId, {
    required: result.passwordChangeRequired,
    skippable: result.passwordChangeSkippable,
  });
}

/**
 * 로컬 로그아웃: 토큰, 세션, 대기 중인 challenge를 버린 뒤 핸들러가 정리하게 한다.
 * `reason`을 주면 로그인 화면이 그 이유로 안내를 먼저 보여준다(사용자가 직접 로그아웃하면 없음).
 */
export function signOutLocally(reason: SessionEndReason | null = null) {
  setAccessToken(null);
  authFlowActions().clear();
  clearTempPasswordToken();
  useSessionStore.getState().actions.clear(reason);
  signOutHandlers.forEach((handler) => handler());
}

/** 서버가 세션을 끝냄: 로컬에서 로그아웃하고 이유를 기억해 안내가 설명할 수 있게 한다. */
function endSessionFromServer(code: ErrorCode) {
  // `UNAUTHORIZED`(→ `TOKEN_EXPIRED`), `SESSION_EXPIRED`, 알 수 없는 401은 모두 일반 만료 안내로 보여준다.
  signOutLocally(code === 'SESSION_REPLACED' ? 'replaced' : 'expired');
}

// 토큰을 실은 요청에 401이 오면 세션이 끝난다.
setUnauthorizedHandler(endSessionFromServer);
