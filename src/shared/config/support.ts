/**
 * 로그인 및 상태 화면에 표시하는 고객센터 연락처. `phone`은 `tel:`용 숫자, `display`는 표기용 번호다.
 * `hours`는 평일 운영 시작·종료 시각이다: 디자인의 "평일 [운영 시간]" 자리 표시 값이며 실제 운영 시간이 정해지면 바꾼다.
 * `kakaoChatUrl`은 카카오톡 채널 채팅 주소: 카카오톡이 설치돼 있으면 앱으로, 없으면 브라우저 웹 채팅으로 열린다(`openSupportChat`).
 * https여야 iOS 유니버설 링크로 카카오톡 앱이 열린다(http는 브라우저로만 열림).
 */
export const SUPPORT = {
  phone: '15440000',
  display: '1544-0000',
  hours: { open: '09:00', close: '18:00' },
  kakaoChatUrl: 'https://pf.kakao.com/_xlxbxdkxj/chat',
} as const;
