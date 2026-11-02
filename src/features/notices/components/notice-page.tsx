import { View } from 'react-native';

import { NativeFormScroll } from '@/shared/ui/native-form-scroll';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

import { NoticeImage } from './notice-image';
import { hasText, imageHeightOf } from '../model/notice-layout';
import type { NoticePopup } from '../model/schemas';

/**
 * One page of the carousel, in one of three shapes: a picture alone (the text is inside the picture), a picture with a
 * title and body under it, or text only. Text lives in a native scroll so a long body never pushes the buttons away.
 */
export function NoticePage({ notice, width, height, maxImageHeight }: { notice: NoticePopup; width: number; height: number; maxImageHeight: number }) {
  return (
    <View style={{ width, height }}>
      {notice.image ? <NoticeImage image={notice.image} height={imageHeightOf(notice, width, maxImageHeight)} label={notice.title} /> : null}
      {hasText(notice) || !notice.image ? (
        <NativeHost fill>
          <NativeFormScroll bottomInset={0}>
            <NativeText variant="title">{notice.title}</NativeText>
            <NativeText>{notice.body}</NativeText>
          </NativeFormScroll>
        </NativeHost>
      ) : null}
    </View>
  );
}
