import { Host, RNHostView } from '@expo/ui';
import { HorizontalPager } from '@expo/ui/jetpack-compose';

import { NoticePage } from './notice-page';
import { isNearPage, type NoticePagerProps } from './notice-pager.types';

/** Compose `HorizontalPager`로 만든 공지 캐러셀: 네이티브 스와이프·스냅·플링, JS 스크롤 없음. */
export function NoticePager({ notices, width, height, maxImageHeight, index, onPageChange }: NoticePagerProps) {
  return (
    <Host style={{ width, height }}>
      <HorizontalPager onSettledPageChange={onPageChange}>
        {notices.map((notice, page) => (
          <RNHostView key={notice.id}>
            <NoticePage notice={notice} width={width} height={height} maxImageHeight={maxImageHeight} showImage={isNearPage(page, index)} />
          </RNHostView>
        ))}
      </HorizontalPager>
    </Host>
  );
}
