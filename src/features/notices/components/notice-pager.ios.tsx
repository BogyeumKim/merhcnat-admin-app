import { Host, RNHostView } from '@expo/ui';
import { TabView } from '@expo/ui/swift-ui';
import { tabViewStyle } from '@expo/ui/swift-ui/modifiers';

import { NoticePage } from './notice-page';
import { isNearPage, type NoticePagerProps } from './notice-pager.types';

/** SwiftUI 자체 점이 없는 페이지 스타일(흰 시트 위에서 흰색이라 안 보임). 시트가 자체 `PageDots`를 그린다. */
const PAGE_STYLE = tabViewStyle({ type: 'page', indexDisplayMode: 'never' });

/** 페이지 스타일 SwiftUI `TabView`로 만든 공지 캐러셀: 네이티브 스와이프·페이징, JS 스크롤 없음. */
export function NoticePager({ notices, width, height, maxImageHeight, index, onPageChange }: NoticePagerProps) {
  return (
    <Host style={{ width, height }}>
      <TabView
        defaultSelection={notices[0]?.id}
        onSelectionChange={(id) => onPageChange(Math.max(0, notices.findIndex((notice) => notice.id === id)))}
        modifiers={[PAGE_STYLE]}>
        {notices.map((notice, page) => (
          <TabView.Tab key={notice.id} value={notice.id}>
            <RNHostView>
              <NoticePage notice={notice} width={width} height={height} maxImageHeight={maxImageHeight} showImage={isNearPage(page, index)} />
            </RNHostView>
          </TabView.Tab>
        ))}
      </TabView>
    </Host>
  );
}
