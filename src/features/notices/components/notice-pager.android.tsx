import { Host, RNHostView } from '@expo/ui';
import { HorizontalPager } from '@expo/ui/jetpack-compose';

import { NoticePage } from './notice-page';
import type { NoticePagerProps } from './notice-pager.types';

/** The notice carousel as a Compose `HorizontalPager`: native swipe, snap and fling, no JS scroll. */
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
