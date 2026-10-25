import { z } from 'zod';

import { env } from '@/shared/config/env';
import { getCurrentLanguage } from '@/shared/i18n';

import { ApiError, toErrorCode } from './errors';
import { getAccessToken, getSessionGeneration, notifyUnauthorized, setAccessToken } from './session-token';

/** Response header carrying a lengthened token (sliding expiration). Proposed name, see docs/backend-contract. */
const TOKEN_RESPONSE_HEADER = 'Access-Token';
const TIMEOUT_MS = 15_000;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

const problemSchema = z.looseObject({
  code: z.string().optional(),
  title: z.string().optional(),
  detail: z.string().optional(),
});

async function toApiError(response: Response): Promise<ApiError> {
  const retryAfter = Number(response.headers.get('Retry-After'));
  const retryExtras = Number.isFinite(retryAfter) && retryAfter > 0 ? { retryAfterSeconds: retryAfter } : {};

  // A proxy or CDN may answer 503 with HTML: treat anything that is not valid problem+json as an unknown error.
  const parsed = problemSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    return new ApiError({
      status: response.status,
      code: response.status === 503 ? 'MAINTENANCE' : 'UNKNOWN',
      extras: retryExtras,
    });
  }

  const { code, title, detail, ...rest } = parsed.data;
  return new ApiError({
    status: response.status,
    code: toErrorCode(code),
    message: detail ?? title,
    extras: { ...rest, ...retryExtras },
  });
}

/**
 * `expo/fetch` reports an aborted request as a plain `FetchError` (the reason is in `cause`, the error `name` is
 * just "Error"), so decide by the signals: a caller abort is surfaced as is, a fired timeout is `TIMEOUT`,
 * everything else is a network failure.
 */
function toTransportError(error: unknown, timeout: AbortSignal, caller?: AbortSignal): unknown {
  if (caller?.aborted) return error;
  if (timeout.aborted) return new ApiError({ status: 0, code: 'TIMEOUT' });
  return new ApiError({ status: 0, code: 'NETWORK_ERROR' });
}

/** Sends the request. The lengthened token is returned, not applied: the caller applies it once the response is accepted. */
async function send(path: string, options: RequestOptions): Promise<{ response: Response; refreshedToken: string | null }> {
  const generation = getSessionGeneration();
  const token = getAccessToken();
  const headers = new Headers({
    Accept: 'application/json, application/problem+json',
    'Accept-Language': getCurrentLanguage(),
  });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal,
    });
  } catch (error) {
    throw toTransportError(error, timeout, options.signal);
  }

  // The session may have ended while this request was in flight: then its response must not touch the new state.
  const sameSession = generation === getSessionGeneration();

  if (!response.ok) {
    const error = await toApiError(response);
    if (response.status === 401 && token && sameSession) notifyUnauthorized();
    throw error;
  }
  return { response, refreshedToken: sameSession ? response.headers.get(TOKEN_RESPONSE_HEADER) : null };
}

/**
 * Thin wrapper over the global `fetch` (= `expo/fetch` on SDK 56+): attaches the bearer token and language,
 * replaces the in-memory token when the server sends a lengthened one, and normalizes failures into `ApiError`.
 */
export async function apiFetch(path: string, options: RequestOptions = {}): Promise<Response> {
  const { response, refreshedToken } = await send(path, options);
  if (refreshedToken) setAccessToken(refreshedToken);
  return response;
}

/**
 * `apiFetch` + runtime validation of the JSON body. A body that does not match the schema is an `INVALID_RESPONSE`
 * and its token header is NOT applied (a rejected response must not leave a token behind).
 */
export async function apiJson<T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}): Promise<T> {
  const { response, refreshedToken } = await send(path, options);
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new ApiError({ status: response.status, code: 'INVALID_RESPONSE' });
  if (refreshedToken) setAccessToken(refreshedToken);
  return parsed.data;
}
