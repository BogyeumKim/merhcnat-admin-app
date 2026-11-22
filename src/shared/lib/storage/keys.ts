/** 저장되는 모든 설정 키는 여기에 둔다(평문 SQLite). 민감 값(기기 비밀키)은 expo-secure-store, 로그인 토큰은 저장하지 않는다(메모리 전용). */
export const STORAGE_KEYS = {
  language: 'preferences.language',
  /** 홈 금액이 가려져 있으면 '1'(계산대에서의 프라이버시). */
  hideAmounts: 'home.hideAmounts',
  /** `{ date, ids }`: 오늘 하루 숨긴 로그인 공지(`features/notices`). */
  noticeHiddenToday: 'notices.hiddenToday',
  /** 이 설치에서 이전 설치의 기기 값(SecureStore)을 정리했으면 '1'. 앱 삭제 때 함께 지워진다(`features/auth`). */
  installMarker: 'install.marker',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
