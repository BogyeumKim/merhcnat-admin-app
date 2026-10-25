/**
 * In-memory access token. Deliberately never persisted: every app launch starts signed out.
 * It lives outside React so the API client can read and replace it (sliding expiration).
 *
 * `generation` increases on every sign-out. A request remembers the generation it started in and ignores its own
 * response (new token, 401) if the session ended meanwhile, so a late response can neither revive a signed-out
 * session nor sign out the next one.
 */
let accessToken: string | null = null;
let generation = 0;
let unauthorizedHandler: (() => void) | null = null;

export const getAccessToken = () => accessToken;
export const getSessionGeneration = () => generation;

export const setAccessToken = (token: string | null) => {
  if (token === null) generation += 1;
  accessToken = token;
};

/** Registered by the auth feature: called when a request that carried a token comes back 401. */
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};
export const notifyUnauthorized = () => unauthorizedHandler?.();
