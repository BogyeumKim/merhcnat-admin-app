import { Column, type Icon } from '@expo/ui';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { CONTENT_MAX_WIDTH, spacing, useNativeColors } from '@/shared/theme';

import { BrandLogo } from './brand-logo';
import { IconButton } from './icon-button';
import { ICON_BUTTON_TARGET } from './icon-button.types';
import { NativeHost } from './native-host';
import { NativeText } from './native-text';

type HeaderAction = {
  icon: ComponentProps<typeof Icon>['name'];
  label: string;
  testID: string;
  onPress: () => void;
};

/**
 * 탭 화면 상단 바. 대부분의 소비자/핀테크 앱이 쓰는 패턴으로, 왼쪽에 브랜드 워드마크, 오른쪽에 아이콘 액션(알림)을 둔다.
 *  일반 RN `View` 행이며, 각 액션은 44pt 터치 영역의 작은 `@expo/ui` Host다.
 *  넓은 창(펼친 폴더블)에서는 아래 본문(`FormColumn`)과 같은 `CONTENT_MAX_WIDTH`로 가운데 둔다. 창 끝까지 늘어나면
 *  제목은 왼쪽 끝, 알림 버튼은 오른쪽 끝에 떨어져 가운데 카드 열과 맞지 않았다.
 */
export function AppHeader({ actions, title }: { actions: readonly HeaderAction[]; title?: string }) {
  const colors = useNativeColors();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: CONTENT_MAX_WIDTH,
        alignSelf: 'center',
        paddingHorizontal: spacing.md,
        minHeight: ICON_BUTTON_TARGET + spacing.sm,
      }}>
      {title ? (
        <View style={{ flex: 1 }}>
          <NativeHost>
            <Column style={{ width: '100%' }}>
              <NativeText variant="title">{title}</NativeText>
            </Column>
          </NativeHost>
        </View>
      ) : (
        <BrandLogo height={26} />
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {actions.map((action) => (
          <View key={action.testID} style={{ width: ICON_BUTTON_TARGET, height: ICON_BUTTON_TARGET }}>
            <NativeHost fill>
              <IconButton icon={action.icon} label={action.label} onPress={action.onPress} testID={action.testID} color={colors.ink} />
            </NativeHost>
          </View>
        ))}
      </View>
    </View>
  );
}
