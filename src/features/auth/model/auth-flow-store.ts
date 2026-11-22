import { create } from 'zustand';
import { combine } from 'zustand/middleware';

import { clearChallengeToken } from './challenge-vault';
import type { ChallengeRequired } from './schemas';

type State = {
  challenge: ChallengeRequired | null;
  /** 새 challenge마다 바뀌어, 인증 화면이 다시 첫 단계에서 시작하게 한다. */
  flowId: number;
  /** 현재 challenge의 코드 검증이 성공함(로그인 완료 또는 임시비밀번호 단계로 넘어감). */
  succeeded: boolean;
  /**
   * 로그인 화면을 떠나 진행한 인증 흐름이 성공 없이 끝난 횟수(2단계 인증: 닫기·스와이프·뒤로가기, 발송 한도, 만료, 잠김 등.
   * 임시비밀번호·만료 비밀번호 변경: 취소, 토큰 만료). 로그인 화면은 이 값을 폼 `key`로 써서 아이디·비밀번호를 모두 초기화한다.
   */
  abandonedCount: number;
};

const initialState: State = { challenge: null, flowId: 0, succeeded: false, abandonedCount: 0 };

/**
 * 진행 중인 추가 인증 단계(서버가 요구한 내용이며 비밀 값은 아님). 메모리 전용이며 로그인, 로그아웃, 취소 시
 * 지운다. 지우면 보관 중인 challenge 토큰(`challenge-vault`)도 함께 폐기된다.
 * 성공 표시(`succeed`) 없이 challenge를 지우면 `abandonedCount`가 오른다: 끝난 이유와 무관하게 한 곳에서 판정한다.
 * challenge가 없는 흐름(로그인 전 비밀번호 변경)은 `abandon()`으로 직접 올린다.
 */
const useAuthFlowStore = create(
  combine(initialState, (set) => ({
    actions: {
      start: (challenge: ChallengeRequired) => set((state) => ({ challenge, flowId: state.flowId + 1, succeeded: false })),
      succeed: () => set({ succeeded: true }),
      /** challenge 밖의 인증 흐름(로그인 전 비밀번호 변경)이 로그인 없이 끝남. */
      abandon: () => set((state) => ({ abandonedCount: state.abandonedCount + 1 })),
      clear: () => {
        clearChallengeToken();
        set((state) => ({
          challenge: null,
          succeeded: false,
          abandonedCount: state.challenge !== null && !state.succeeded ? state.abandonedCount + 1 : state.abandonedCount,
        }));
      },
    },
  })),
);

export const useAuthChallenge = () => useAuthFlowStore((store) => store.challenge);
export const useAuthFlowId = () => useAuthFlowStore((store) => store.flowId);
export const useAuthFlowActions = () => useAuthFlowStore((store) => store.actions);
/** 로그인 화면용: 값이 바뀌면 인증 흐름이 성공 없이 끝났다(폼을 다시 마운트해 모두 비운다). */
export const useAbandonedFlowCount = () => useAuthFlowStore((store) => store.abandonedCount);

/** React 외부 코드용(세션 완료 처리). */
export const authFlowActions = () => useAuthFlowStore.getState().actions;

/** React 외부 코드용(코드 검증 mutation이 입력한 아이디를 세션으로 넘길 때). */
export const getAuthChallenge = () => useAuthFlowStore.getState().challenge;
