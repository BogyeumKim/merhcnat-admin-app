import { z } from 'zod';

import { presentationOf, type ErrorPresentation } from './error-presentation';
import type { ApiError } from './errors';

const isoDate = z.iso.datetime({ offset: true });
const nonEmpty = z.string().min(1);
const version = z.string().regex(/^\d+(\.\d+){0,3}$/);

/** 전용 화면으로 보내는 표시 방식. 나머지(`inline`, `toast`)는 화면이 직접 보여준다. */
export type BlockingPresentation = Exclude<ErrorPresentation, 'inline' | 'toast'>;

/** 서버가 준 선택값(`extras[from]`)을 각각 검증해, 한쪽이 잘못되어도 다른 쪽은 화면 파라미터(`param`)로 전달한다. */
function pickParams(error: ApiError, fields: Record<string, { from: string; schema: z.ZodType<string> }>) {
  const params: Record<string, string> = {};
  for (const [param, { from, schema }] of Object.entries(fields)) {
    const parsed = schema.safeParse(error.extras[from]);
    if (parsed.success) params[param] = parsed.data;
  }
  return params;
}

/**
 * 차단 오류(점검, 필수 업데이트, 보안 위험 기기, 계정 잠김, 정지)의 라우트 대상. 인증 흐름과 로그인 후 쿼리가 같은 화면으로
 * 보내므로 라우트 이름과 파라미터를 여기 한 곳에서 만든다(각 화면은 같은 파라미터 이름을 읽는다). `inline`/`toast`이면 `null`.
 */
export function blockingErrorRoute(error: ApiError) {
  const kind = presentationOf(error.code);
  switch (kind) {
    case 'maintenance':
      return {
        kind,
        href: {
          pathname: '/maintenance' as const,
          params: pickParams(error, { startAt: { from: 'startAt', schema: isoDate }, endAt: { from: 'endAt', schema: isoDate } }),
        },
      };
    case 'update':
      return {
        kind,
        href: { pathname: '/update-required' as const, params: pickParams(error, { latest: { from: 'latestVersion', schema: version } }) },
      };
    case 'insecure':
      return { kind, href: '/insecure-device' as const };
    case 'locked':
      return {
        kind,
        href: {
          pathname: '/account-locked' as const,
          params: pickParams(error, {
            userIdMasked: { from: 'userIdMasked', schema: nonEmpty },
            lockedAt: { from: 'lockedAt', schema: isoDate },
          }),
        },
      };
    case 'suspended':
      return { kind, href: '/account-suspended' as const };
    case 'inline':
    case 'toast':
      return null;
  }
}
