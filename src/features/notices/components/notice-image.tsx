import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { useNativeColors } from '@/shared/theme';

import type { NoticePopup } from '../model/schemas';

/**
 * 공지 이미지. 시트가 확보한 너비/높이로 그려 레이아웃이 튀지 않고, 디스크에 캐시한다. 불러오기에
 * 실패한 이미지는 빈 구멍을 남기지 않고 사라진다. 원격 이미지는 반드시 이 컴포넌트를 통해서만 표시한다.
 */
export function NoticeImage({ image, height, label }: { image: NonNullable<NoticePopup['image']>; height: number; label: string }) {
  const colors = useNativeColors();
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <View style={{ width: '100%', height, backgroundColor: colors.field }}>
      <Image
        source={{ uri: image.url }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessible
        alt={image.alt ?? label}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
