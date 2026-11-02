import { View } from 'react-native';

import { NativeFormScroll } from '@/shared/ui/native-form-scroll';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

import { NoticeImage } from './notice-image';
import type { NoticePopup } from '../model/schemas';

/** One page of the carousel: optional image on top, then the title and plain-text body in a native scroll. */
export function NoticePage({ notice, width, height }: { notice: NoticePopup; width: number; height: number }) {
  return (
    <View style={{ width, height }}>
      {notice.image ? <NoticeImage image={notice.image} /> : null}
      <NativeHost fill>
        <NativeFormScroll bottomInset={0}>
          <NativeText variant="title">{notice.title}</NativeText>
          <NativeText>{notice.body}</NativeText>
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
