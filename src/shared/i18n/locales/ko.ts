import type { en } from './en';

/** Typed against `en` so a missing or extra key is a compile error. */
export const ko: typeof en = {
  common: {
    retry: '다시 시도',
    cancel: '취소',
    continue: '계속',
    ok: '확인',
  },
  tabs: {
    home: '홈',
    menu: '전체메뉴',
  },
  errors: {
    screenTitle: '문제가 발생했습니다',
    UNKNOWN: '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
    ACCOUNT_TYPE_NOT_ALLOWED: '이 계정 유형은 앱에서 로그인할 수 없습니다.',
    MAINTENANCE: '서비스 점검 중입니다.',
    OTP_INVALID: '인증번호가 올바르지 않습니다.',
    OTP_EXPIRED: '인증번호가 만료되었습니다. 새로 요청해 주세요.',
    OTP_LOCKED: '시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.',
    TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해 주세요.',
    NETWORK_ERROR: '네트워크에 연결할 수 없습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.',
    TIMEOUT: '요청 시간이 초과되었습니다. 다시 시도해 주세요.',
    INVALID_RESPONSE: '서버에서 예상하지 못한 응답을 받았습니다.',
  },
  home: {
    title: '홈',
    body: '가맹점 현황이 이곳에 표시됩니다.',
    preparing: '준비 중입니다.',
  },
  menu: {
    title: '전체메뉴',
  },
};
