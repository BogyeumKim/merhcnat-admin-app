import { Icon } from '@expo/ui';

/**
 * 앱의 모든 아이콘(의미 이름 → 플랫폼 네이티브 쌍)을 정의하는 단일 장소. 화면/컴포넌트는 `icons.<이름>`만 쓰고
 * `{ ios, android }`를 직접 쓰지 않는다(훅 `check-icon-map.sh`가 차단).
 *
 * - iOS는 SF Symbols(Apple HIG), Android는 `@expo/material-symbols` XML(Material 3): `@expo/ui` `Icon`의 동작 방식이며
 *   두 플랫폼 공통 세트는 없다. 의도된 선택이다.
 * - `Icon.select` + `import('*.xml')` 형태를 지킨다: `@expo/ui` babel 플러그인이 호출을 대상 플랫폼 값으로 바꿔
 *   다른 플랫폼 에셋이 번들에 들어가지 않는다(평범한 객체는 양쪽 에셋이 모두 실린다). 인자는 객체 리터럴이어야 한다.
 * - 하단 탭 아이콘은 `NativeTabs` API(`sf`/`md` 문자열)가 달라 `core/navigation/app-tabs/config/tabs.ts`에 있다.
 */
export const icons = {
  // 이동·펼침
  /** 화면 뒤로 가기(커스텀 헤더). iOS HIG의 chevron, Android M3의 화살표. */
  back: Icon.select({ ios: 'chevron.left', android: import('@expo/material-symbols/arrow_back.xml') }),
  chevronRight: Icon.select({ ios: 'chevron.right', android: import('@expo/material-symbols/chevron_right.xml') }),
  chevronLeft: Icon.select({ ios: 'chevron.left', android: import('@expo/material-symbols/chevron_left.xml') }),
  chevronUp: Icon.select({ ios: 'chevron.up', android: import('@expo/material-symbols/keyboard_arrow_up.xml') }),
  chevronDown: Icon.select({ ios: 'chevron.down', android: import('@expo/material-symbols/keyboard_arrow_down.xml') }),
  arrowRight: Icon.select({ ios: 'arrow.right', android: import('@expo/material-symbols/arrow_forward.xml') }),

  // 동작
  /** 시트/화면 닫기(상단 바의 X). 입력 지우기(`clear`)와 다른 의미라 별도 이름. */
  close: Icon.select({ ios: 'xmark', android: import('@expo/material-symbols/close.xml') }),
  refresh: Icon.select({ ios: 'arrow.clockwise', android: import('@expo/material-symbols/refresh.xml') }),
  download: Icon.select({ ios: 'arrow.down.to.line', android: import('@expo/material-symbols/download.xml') }),
  notifications: Icon.select({ ios: 'bell', android: import('@expo/material-symbols/notifications.xml') }),
  /** 입력 지우기. Android는 채운 cancel 벡터(Material Symbols에 채운 변형이 없어 프로젝트 에셋). */
  clear: Icon.select({ ios: 'xmark.circle.fill', android: import('@/assets/icons/cancel-filled.xml') }),
  passwordShow: Icon.select({ ios: 'eye', android: import('@expo/material-symbols/visibility.xml') }),
  passwordHide: Icon.select({ ios: 'eye.slash', android: import('@expo/material-symbols/visibility_off.xml') }),

  // 알림·상태
  error: Icon.select({ ios: 'exclamationmark.circle.fill', android: import('@expo/material-symbols/error.xml') }),
  caution: Icon.select({ ios: 'exclamationmark.circle', android: import('@expo/material-symbols/info.xml') }),
  lock: Icon.select({ ios: 'lock', android: import('@expo/material-symbols/lock.xml') }),
  lockReset: Icon.select({ ios: 'lock.rotation', android: import('@expo/material-symbols/lock_reset.xml') }),
  shieldLock: Icon.select({ ios: 'lock.shield', android: import('@expo/material-symbols/shield_lock.xml') }),
  insecureDevice: Icon.select({ ios: 'exclamationmark.shield', android: import('@expo/material-symbols/gpp_maybe.xml') }),
  accountSuspended: Icon.select({
    ios: 'person.crop.circle.badge.exclamationmark',
    android: import('@expo/material-symbols/person_off.xml'),
  }),
  maintenance: Icon.select({ ios: 'wrench.and.screwdriver', android: import('@expo/material-symbols/build.xml') }),
  paymentFailed: Icon.select({
    ios: 'creditcard.trianglebadge.exclamationmark',
    android: import('@expo/material-symbols/credit_card_off.xml'),
  }),

  // 세션·기기
  deviceTransfer: Icon.select({ ios: 'iphone.and.arrow.forward', android: import('@expo/material-symbols/upload.xml') }),
  sessionReplaced: Icon.select({ ios: 'iphone.and.arrow.forward', android: import('@expo/material-symbols/devices.xml') }),
  sessionExpired: Icon.select({ ios: 'clock', android: import('@expo/material-symbols/schedule.xml') }),

  // 고객센터 연락
  /** 전화 상담. iOS HIG 외곽선 수화기, Android M3 `call`. */
  phone: Icon.select({ ios: 'phone', android: import('@expo/material-symbols/call.xml') }),
  /** 확인·안내 표시(점검 영향 범위 박스). */
  check: Icon.select({ ios: 'checkmark', android: import('@expo/material-symbols/check.xml') }),
  /**
   * 카카오톡 말풍선(노란 원 배지 안의 글리프, `SupportContactButtons`). Android는 Kakao 마크(`channel-kakao.svg`)의
   * 말풍선 경로를 옮긴 벡터, iOS는 같은 모양의 SF Symbol.
   */
  kakaoTalk: Icon.select({ ios: 'message.fill', android: import('@/assets/icons/kakao-bubble.xml') }),

  // 인증 수단
  sms: Icon.select({ ios: 'text.bubble', android: import('@expo/material-symbols/sms.xml') }),
  mail: Icon.select({ ios: 'envelope', android: import('@expo/material-symbols/mail.xml') }),
  /** OTP 앱. Android는 기존 화면과 같게 sms 글리프를 쓴다. */
  totp: Icon.select({ ios: 'lock.shield', android: import('@expo/material-symbols/sms.xml') }),
} as const;

export type AppIcon = keyof typeof icons;
