import { Host } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { useNativeColors } from '@/shared/theme';

/**
 * `@expo/ui` `Host`의 프로젝트 기본값: 앱 색상 테마를 따르고, action 색을 네이티브 tint/Material 시드로 쓰며,
 *  부모를 가득 채우거나(스크롤 화면) 콘텐츠 높이에 맞춘다.
 *  `matchContents`는 마운트 시 한 번만 설정할 수 있으므로 `fill`은 첫 렌더 이후 바뀌면 안 된다.
 */
export function NativeHost({ children, fill = false }: PropsWithChildren<{ fill?: boolean }>) {
  const { scheme, action } = useNativeColors();

  return (
    <Host
      colorScheme={scheme}
      seedColor={action}
      matchContents={fill ? undefined : { vertical: true }}
      style={fill ? { flex: 1 } : { alignSelf: 'stretch' }}>
      {children}
    </Host>
  );
}
