/**
 * 로그인 및 상태 화면에 표시하는 고객센터 연락처. `phone`은 `tel:`용 숫자, `display`는 표기용
 * 번호이며, hours는 평일 운영 시작·종료 시각이다.
 */
export const SUPPORT = {
  phone: '15440000',
  display: '1544-0000',
  hours: { open: '09:00', close: '18:00' },
} as const;
