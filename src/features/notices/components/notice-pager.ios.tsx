import { Host, RNHostView } from '@expo/ui';
import { TabView } from '@expo/ui/swift-ui';
import { tabViewStyle } from '@expo/ui/swift-ui/modifiers';

import { NoticePage } from './notice-page';
import type { NoticePagerProps } from './notice-pager.types';

/** Page style without SwiftUI's own dots (they are white on a white sheet); the sheet draws its own `PageDots`. */
const PAGE_STYLE = tabViewStyle({ type: 'page', indexDisplayMode: 'never' });

/** The notice carousel as a SwiftUI `TabView` in page style: native swipe and paging, no JS scroll. */
export function NoticePager({ notices, width, height, maxImageHeight, onPageChange }: NoticePagerProps) {
  return (
    <Host style={{ width, height }}>
      <TabView
        defaultSelection={notices[0]?.id}
        onSelectionChange={(id) => onPageChange(Math.max(0, notices.findIndex((notice) => notice.id === id)))}
        modifiers={[PAGE_STYLE]}>
        {notices.map((notice) => (
          <TabView.Tab key={notice.id} value={notice.id}>
            <RNHostView>
              <NoticePage notice={notice} width={width} height={height} maxImageHeight={maxImageHeight} />
            </RNHostView>
          </TabView.Tab>
        ))}
      </TabView>
    </Host>
  );
}
