import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { useNativeColors } from '@/shared/theme';

import type { NoticePopup } from '../model/schemas';

/**
 * The notice picture, drawn at the width/height the sheet reserved for it (no layout jump), cached on disk. A picture that
 * fails to load disappears instead of leaving a hole. Remote images are only ever shown through here.
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
