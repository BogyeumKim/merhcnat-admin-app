import type { NoticePopup } from '../model/schemas';

/** Development fixtures (`EXPO_PUBLIC_NOTICE_MOCK=1`): one notice with an image, one text-only. */
export const mockPopupNotices: NoticePopup[] = [
  {
    id: 'mock-1',
    title: '서비스 점검 안내',
    body: '더 안정적인 서비스를 위해 정기 점검을 진행합니다.\n점검 시간 동안에는 일부 기능을 이용할 수 없습니다.',
    image: { url: 'https://picsum.photos/seed/korpay-notice/800/500', width: 800, height: 500, alt: '점검 안내 이미지' },
  },
  {
    id: 'mock-2',
    title: '부가세 신고 자료 제공 일정',
    body: '부가세 신고에 필요한 매출 자료를 전체메뉴의 부가세 자료에서 확인할 수 있습니다.',
  },
  {
    id: 'mock-3',
    title: '앱 업데이트 안내',
    body: '더 빠르고 안정적인 새 버전이 준비되었습니다. 스토어에서 최신 버전으로 업데이트해 주세요.',
    image: { url: 'https://picsum.photos/seed/korpay-update/800/500', width: 800, height: 500, alt: '업데이트 안내 이미지' },
  },
];
