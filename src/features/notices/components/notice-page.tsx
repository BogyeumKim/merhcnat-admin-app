import { View } from 'react-native';

import { NativeFormScroll } from '@/shared/ui/native-form-scroll';
import { NativeHost } from '@/shared/ui/native-host';
import { NativeText } from '@/shared/ui/native-text';

import { NoticeImage } from './notice-image';
import { hasText, imageHeightOf } from '../model/notice-layout';
import type { NoticePopup } from '../model/schemas';

/**
 * 캐러셀의 한 페이지. 세 가지 형태 중 하나다: 이미지만(텍스트는 이미지 안에 있음), 이미지 아래 제목과 본문,
 * 또는 텍스트만. 텍스트는 네이티브 스크롤 안에 두어 긴 본문이 버튼을 밀어내지 않는다.
 */
export function NoticePage({
  notice,
  width,
  height,
  maxImageHeight,
  showImage,
}: {
  notice: NoticePopup;
  width: number;
  height: number;
  maxImageHeight: number;
  /** 현재 페이지 근처만 `true`. 멀리 있는 페이지는 같은 높이의 빈 자리만 둬 레이아웃은 그대로 둔다. */
  showImage: boolean;
}) {
  const imageHeight = imageHeightOf(notice, width, maxImageHeight);

  return (
    <View style={{ width, height }}>
      {notice.image ? (
        showImage ? (
          <NoticeImage image={notice.image} height={imageHeight} label={notice.title} />
        ) : (
          <View style={{ height: imageHeight }} />
        )
      ) : null}
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
