import { z } from 'zod';

import { env } from '@/shared/config/env';
import { getCurrentLanguage } from '@/shared/i18n';

import { ApiError, toErrorCode } from './errors';
import { getAccessToken, getSessionGeneration, notifyUnauthorized, setAccessToken } from './session-token';

/** 연장된 토큰을 담은 응답 헤더(슬라이딩 만료). 제안된 이름이며 docs/backend-contract 참고. */
const TOKEN_RESPONSE_HEADER = 'Access-Token';
const TIMEOUT_MS = 15_000;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /**
   * 200이 아닌 status로 오지만 오류가 아니라 "다음 단계"인 envelope `code`(예: 401 `MFA_REQUIRED`, 403 `PASSWORD_CHANGE_REQUIRED`).
   * 서버는 200을 실제 성공에만 쓰므로 이런 결과는 status가 아니라 `code`로 구분한다. 여기 있는 code는 던지지 않고 반환한다.
   */
  outcomeCodes?: readonly string[];
};

/**
 * 서버 응답은 모두 `{ code, message, data? }`이다: 성공은 `code: "SUCCESS"`(HTTP 200만)이고,
 * 그 외는 같은 envelope에 다른 HTTP 상태가 붙는다(추가 인증 필요 401 `MFA_REQUIRED` 등은 `outcomeCodes`로 받는다). `data`는 부가 정보(`remainingAttempts`, `retryAfterSeconds`,
 * 점검 기간)를 담는다. `message`는 로그용이며 화면에 보여주지 않는다.
 */
const envelopeSchema = z.looseObject({
  code: z.string(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

const errorEnvelopeSchema = z.looseObject({
  code: z.string().optional(),
  message: z.string().optional(),
  // 서버는 부가 정보가 없으면 `data: null`을 보낼 수 있다: null을 거부하면 서버 `code`가 버려지고 `UNKNOWN`이 된다.
  data: z.record(z.string(), z.unknown()).nullish(),
});

function toApiError(response: Response, json: unknown): ApiError {
  const retryAfter = Number(response.headers.get('Retry-After'));
  const retryExtras = Number.isFinite(retryAfter) && retryAfter > 0 ? { retryAfterSeconds: retryAfter } : {};

  // 프록시나 CDN이 HTML로 503을 응답할 수 있다: envelope가 아닌 것은 모두 알 수 없는 오류로 처리한다.
  // envelope가 있는 503(예: `SESSION_STORE_UNAVAILABLE`)은 아래에서 서버 `code` 그대로 매핑되므로 점검으로 오인하지 않는다.
  const parsed = errorEnvelopeSchema.safeParse(json);
  if (!parsed.success) {
    return new ApiError({
      status: response.status,
      code: response.status === 503 ? 'MAINTENANCE' : 'UNKNOWN',
      extras: retryExtras,
    });
  }

  const { code, message, data } = parsed.data;
  return new ApiError({
    status: response.status,
    code: toErrorCode(code),
    message,
    extras: { ...(data ?? {}), ...retryExtras },
  });
}

/**
 * `expo/fetch`는 중단된 요청을 일반 `FetchError`로 보고한다(이유는 `cause`에 있고 오류 `name`은
 * 그냥 "Error"). 따라서 신호로 판단한다: 호출자의 중단은 그대로 전달, 발동한 타임아웃은 `TIMEOUT`,
 * 그 외는 네트워크 실패다.
 */
function toTransportError(error: unknown, timeout: AbortSignal, caller?: AbortSignal): unknown {
  if (caller?.aborted) return error;
  if (timeout.aborted) return new ApiError({ status: 0, code: 'TIMEOUT' });
  return new ApiError({ status: 0, code: 'NETWORK_ERROR' });
}

type Sent = {
  response: Response;
  refreshedToken: string | null;
  /** 요청을 시작한 세션. 연장된 토큰은 적용 시점에도 같은 세션일 때만 쓴다(`applyRefreshedToken`). */
  generation: number;
  /** 본문 읽기에도 같은 타임아웃이 걸린다: 헤더 뒤 본문이 멈추면 `TIMEOUT`으로 보고한다. */
  timeout: AbortSignal;
  /** 200이 아닌 `outcomeCodes` 응답은 본문을 이미 읽었으므로 여기에 담는다. */
  body?: unknown;
};

/** JSON 본문을 읽는다. 파싱 실패는 `null`(호출자가 `INVALID_RESPONSE`로 처리), 타임아웃으로 끊긴 본문은 `TIMEOUT`. */
async function readJson(response: Response, timeout: AbortSignal): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    if (timeout.aborted) throw new ApiError({ status: 0, code: 'TIMEOUT' });
    return null;
  }
}

/**
 * 연장된 토큰을 적용한다. 본문을 읽는 동안(`await`) 로그아웃했을 수 있으므로 적용 직전에 세션을 다시 확인한다:
 * 그렇지 않으면 늦게 온 응답이 로그아웃 뒤 메모리에 토큰을 되살린다.
 */
function applyRefreshedToken({ refreshedToken, generation }: Sent) {
  if (refreshedToken && generation === getSessionGeneration()) setAccessToken(refreshedToken);
}

/** 요청을 보낸다. 연장된 토큰은 적용하지 않고 반환한다: 응답이 수락된 뒤 호출자가 한 번 적용한다. */
async function send(path: string, options: RequestOptions): Promise<Sent> {
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

  // 요청이 진행 중인 동안 세션이 끝났을 수 있다: 그 응답이 새 상태를 건드려서는 안 된다.
  const sameSession = generation === getSessionGeneration();

  if (!response.ok) {
    const json = await readJson(response, timeout);
    const outcome = envelopeSchema.safeParse(json);
    // 오류가 아닌 다음 단계 결과: 세션 종료(401 처리)도 하지 않는다.
    if (outcome.success && options.outcomeCodes?.includes(outcome.data.code)) {
      return { response, refreshedToken: null, generation, timeout, body: json };
    }
    const error = toApiError(response, json);
    // 401(SESSION_REPLACED, SESSION_EXPIRED, UNAUTHORIZED)만 세션을 끝낸다. 503 SESSION_STORE_UNAVAILABLE은 토큰을 유지한다.
    if (response.status === 401 && token && sameSession) notifyUnauthorized(error.code);
    throw error;
  }
  return { response, refreshedToken: sameSession ? response.headers.get(TOKEN_RESPONSE_HEADER) : null, generation, timeout };
}

/**
 * 전역 `fetch`(SDK 56+에서는 `expo/fetch`)의 얇은 래퍼: bearer 토큰과 언어를 붙이고,
 * 서버가 연장된 토큰을 보내면 메모리 토큰을 교체하며, 실패를 `ApiError`로 정규화한다.
 */
export async function apiFetch(path: string, options: RequestOptions = {}): Promise<Response> {
  const sent = await send(path, options);
  applyRefreshedToken(sent);
  return sent.response;
}

/**
 * `{ code, message, data }` envelope용 `apiFetch`: `data`를 `dataSchema`로 검증하고 HTTP 상태, envelope `code`,
 * 검증된 `data`를 반환한다. 호출자는 status가 아니라 `code`로 분기한다(같은 401이 여러 의미로 온다).
 * 스키마와 맞지 않는 본문은 `INVALID_RESPONSE`이며, 토큰 헤더는 응답 전체가 수락된 뒤에만 적용한다(거부된 응답이 토큰을 남기면 안 된다).
 */
export async function apiEnvelope<T>(
  path: string,
  dataSchema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<{ status: number; code: string; data: T }> {
  const sent = await send(path, options);
  const { response, body } = sent;
  const envelope = envelopeSchema.safeParse(body === undefined ? await readJson(response, sent.timeout) : body);
  if (!envelope.success) throw new ApiError({ status: response.status, code: 'INVALID_RESPONSE' });
  const data = dataSchema.safeParse(envelope.data.data);
  if (!data.success) throw new ApiError({ status: response.status, code: 'INVALID_RESPONSE' });
  applyRefreshedToken(sent);
  return { status: response.status, code: envelope.data.code, data: data.data };
}
