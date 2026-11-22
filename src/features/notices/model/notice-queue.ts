import type { NoticePopup } from './schemas';

/** 한 번에 보여줄 일반 공지 수. 서버가 우선순위 순으로 보내므로 앞에서 자른다(계약에 개수 제한이 없어 앱이 상한을 둔다). */
const MAX_SHEET_PAGES = 5;

/** 필수 공지: 가운데 다이얼로그로 하나씩, [확인]으로만 닫는다. "오늘 하루 보지 않기"가 없으므로 숨김 목록을 보지 않는다. */
export const requiredNoticesOf = (notices: readonly NoticePopup[]) => notices.filter((notice) => notice.required);

/** 일반 공지: 바텀 시트 페이지. 오늘 숨긴 공지는 뺀다. */
export const sheetNoticesOf = (notices: readonly NoticePopup[], hiddenToday: ReadonlySet<string>) =>
  notices.filter((notice) => !notice.required && !hiddenToday.has(notice.id)).slice(0, MAX_SHEET_PAGES);
