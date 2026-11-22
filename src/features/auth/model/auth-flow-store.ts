import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import { clearChallengeToken } from './challenge-vault';
import type { ChallengeRequired } from './schemas';

type State = {
  challenge: ChallengeRequired | null;
  /** 새 challenge마다 바뀌어, 인증 화면이 다시 첫 단계에서 시작하게 한다. */
  flowId: number;
};

const initialState: State = { challenge: null, flowId: 0 };

/**
 * 진행 중인 추가 인증 단계(서버가 요구한 내용이며 비밀 값은 아님). 메모리 전용이며 로그인, 로그아웃, 취소 시
 * 지운다. 지우면 보관 중인 challenge 토큰(`challenge-vault`)도 함께 폐기된다.
 * 성공 없이 끝나도 로그인 폼은 건드리지 않는다(아이디·비밀번호 유지, `docs/architecture/login-ui.md`).
 */
const useAuthFlowStore = create(
  combine(initialState, (set) => ({
    actions: {
      start: (challenge: ChallengeRequired) => set((state) => ({ challenge, flowId: state.flowId + 1 })),
      clear: () => {
        clearChallengeToken();
        set({ challenge: null });
      },
    },
  })),
);

export const useAuthChallenge = () => useAuthFlowStore((store) => store.challenge);
export const useAuthFlowId = () => useAuthFlowStore((store) => store.flowId);

/** React 외부 코드용(세션 완료 처리). */
export const authFlowActions = () => useAuthFlowStore.getState().actions;

/** React 외부 코드용(코드 검증 mutation이 입력한 아이디를 세션으로 넘길 때). */
export const getAuthChallenge = () => useAuthFlowStore.getState().challenge;
