import type { NoticePopup } from '../model/schemas';

/** 개발용 fixture(`EXPO_PUBLIC_NOTICE_MOCK=1`): 필수 공지(다이얼로그) 1건, 이미지만(텍스트는 이미지 안), 텍스트만, 이미지 + 텍스트. */
export const mockPopupNotices: NoticePopup[] = [
  {
    id: 'mock-required-1',
    title: '개인정보 처리방침 변경 안내',
    body: '개인정보 처리방침이 변경되었습니다. 변경된 내용은 전체메뉴의 약관에서 확인할 수 있습니다.',
    required: true,
  },
  {
    id: 'mock-1',
    title: '서비스 점검 안내',
    body: '',
    required: false,
    image: { url: 'https://placehold.co/800x600/E10033/FFFFFF/png?text=Service+maintenance+notice', width: 800, height: 600, alt: '서비스 점검 안내' },
  },
  {
    id: 'mock-2',
    title: '부가세 신고 자료 제공 일정',
    body: '부가세 신고에 필요한 매출 자료를 전체메뉴의 부가세 자료에서 확인할 수 있습니다.',
    required: false,
  },
  {
    id: 'mock-3',
    title: '앱 업데이트 안내',
    body: '더 빠르고 안정적인 새 버전이 준비되었습니다. 스토어에서 최신 버전으로 업데이트해 주세요.',
    required: false,
    image: { url: 'https://placehold.co/800x400/2D3640/FFFFFF/png?text=New+version', width: 800, height: 400, alt: '업데이트 안내 이미지' },
  },
];
