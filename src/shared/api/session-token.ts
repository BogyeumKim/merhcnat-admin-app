import { createStore } from 'zustand/vanilla';

import type { ErrorCode } from './errors';

/**
 * 메모리 액세스 토큰 store (zustand vanilla, `persist` 없음). 앱을 켤 때마다 로그아웃 상태로 시작한다.
 * SecureStore에 두지 않는 이유: refresh token이 없고 앱 실행마다 로그인하는 정책이라 디스크에 남길 이유가 없다.
 * API 클라이언트가 React 밖에서 읽고 교체(슬라이딩 만료)하므로 vanilla store로 둔다.
 *
 * `generation`은 로그아웃할 때마다 증가한다. 요청은 시작 시점의 generation을 기억해 두고, 그사이 세션이
 * 끝났으면 자신의 응답(새 토큰, 401)을 무시한다. 그래서 늦게 온 응답이 로그아웃된 세션을 되살리거나
 * 다음 세션을 로그아웃시키지 못한다.
 */
type TokenState = { accessToken: string | null; generation: number };

const tokenStore = createStore<TokenState>()(() => ({ accessToken: null, generation: 0 }));

let unauthorizedHandler: ((code: ErrorCode) => void) | null = null;

export const getAccessToken = () => tokenStore.getState().accessToken;
export const getSessionGeneration = () => tokenStore.getState().generation;

export const setAccessToken = (token: string | null) => {
  tokenStore.setState((state) => ({
    accessToken: token,
    generation: token === null ? state.generation + 1 : state.generation,
  }));
};

/** auth feature가 등록: 토큰을 실은 요청이 401로 돌아왔을 때 응답 `code`(종료 이유)와 함께 호출된다. */
export const setUnauthorizedHandler = (handler: ((code: ErrorCode) => void) | null) => {
  unauthorizedHandler = handler;
};
export const notifyUnauthorized = (code: ErrorCode) => unauthorizedHandler?.(code);
