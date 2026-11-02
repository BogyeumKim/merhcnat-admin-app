import { Column, Icon } from '@expo/ui';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { spacing, useNativeColors } from '@/shared/theme';

import { BrandLogo } from './brand-logo';
import { NativeHost } from './native-host';

type HeaderAction = {
  icon: ComponentProps<typeof Icon>['name'];
  label: string;
  testID: string;
  onPress: () => void;
};

const ACTION_SIZE = 44;

/**
 * Top bar of the tab screens, the pattern nearly every consumer and fintech app shares: the brand wordmark on the left,
 * icon actions (notifications) on the right. Plain RN `View` row; each action is a tiny `@expo/ui` Host with a 44pt target.
 */
export function AppHeader({ actions }: { actions: readonly HeaderAction[] }) {
  const colors = useNativeColors();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, minHeight: ACTION_SIZE + spacing.sm }}>
      <BrandLogo height={26} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {actions.map((action) => (
          <View key={action.testID} style={{ width: ACTION_SIZE, height: ACTION_SIZE }}>
            <NativeHost fill>
              <Column onPress={action.onPress} testID={action.testID} style={{ width: ACTION_SIZE, height: ACTION_SIZE, padding: 10 }}>
                <Icon name={action.icon} size={24} color={colors.ink} accessibilityLabel={action.label} />
              </Column>
            </NativeHost>
          </View>
        ))}
      </View>
    </View>
  );
}
