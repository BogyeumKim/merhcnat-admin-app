import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { useNativeColors } from '@/shared/theme';

import type { NoticePopup } from '../model/schemas';

/**
 * The notice picture: height is reserved from the server's width/height (no layout jump), the file is cached on disk, and
 * a picture that fails to load disappears instead of leaving a hole. Remote images are only ever shown through here.
 */
export function NoticeImage({ image }: { image: NonNullable<NoticePopup['image']> }) {
  const colors = useNativeColors();
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <View style={{ width: '100%', aspectRatio: image.width / image.height, backgroundColor: colors.field }}>
      <Image
        source={{ uri: image.url }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessible={image.alt !== undefined}
        alt={image.alt}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
