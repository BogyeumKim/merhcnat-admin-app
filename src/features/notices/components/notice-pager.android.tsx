import { Host, RNHostView } from '@expo/ui';
import { HorizontalPager } from '@expo/ui/jetpack-compose';

import { NoticePage } from './notice-page';
import type { NoticePagerProps } from './notice-pager.types';

/** Compose `HorizontalPager`로 만든 공지 캐러셀: 네이티브 스와이프·스냅·플링, JS 스크롤 없음. */
export function NoticePager({ notices, width, height, maxImageHeight, onPageChange }: NoticePagerProps) {
  return (
    <Host style={{ width, height }}>
      <HorizontalPager onSettledPageChange={onPageChange}>
        {notices.map((notice) => (
          <RNHostView key={notice.id}>
            <NoticePage notice={notice} width={width} height={height} maxImageHeight={maxImageHeight} />
          </RNHostView>
        ))}
      </HorizontalPager>
    </Host>
  );
}
