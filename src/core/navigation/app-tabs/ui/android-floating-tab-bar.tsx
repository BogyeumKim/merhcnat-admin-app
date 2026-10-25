import { Host } from '@expo/ui';
import { Column, Icon, NavigationBarItem, Row, Shape, Surface, Text } from '@expo/ui/jetpack-compose';
import {
  dropShadow,
  fillMaxSize,
  fillMaxWidth,
  height,
  padding,
  selectableGroup,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, useColorScheme, View, type ImageSourcePropType } from 'react-native';

import {
  BAR_HEIGHT,
  BOTTOM_MARGIN,
  CORNER_RADIUS,
  HORIZONTAL_MARGIN,
  LABEL_FONT_SIZE,
  LABEL_LINE_HEIGHT,
  SHADOW_HEADROOM,
  useTabLabelScale,
} from '@/shared/lib/tab-bar';

import type { TabName } from '../config/tabs';

/**
 * Android-only: renders the bottom tab bar with real Jetpack Compose Material 3
 * `NavigationBarItem`s, in a rounded container floated above the screen content.
 * Never import this on iOS — `@expo/ui/jetpack-compose` is Android-only.
 *
 * The items sit in a plain Compose `Row` rather than M3's `NavigationBar` container.
 * `NavigationBar` hard-codes `windowInsetsPadding(systemBars.bottom)` and an 80dp min content
 * height, and `@expo/ui` exposes no way to override its `windowInsets`. Inside a floating bar
 * that padding is dead space. `Row` provides the same `RowScope` the items need (the native
 * `NavigationBarItem` reads `composableScope.rowScope`), so the items keep their M3 indicator,
 * ripple, and colors.
 *
 * SDK 58: `expo-router/js-tabs` passes `{ state, descriptors, emitter, navigateToTab, insets }`
 * to a custom `tabBar` — there is no `navigation` prop any more.
 */

/**
 * The same rounded shape expressed in the two forms Expo UI needs:
 * `Shapes.*` for modifiers, `Shape.*` for a component's `shape` prop.
 * Module-level so the native props keep a stable identity across renders.
 */
const SHADOW_SHAPE = Shapes.RoundedCorner(CORNER_RADIUS);
const SURFACE_SHAPE = Shape.RoundedCorner({
  cornerRadii: {
    topStart: CORNER_RADIUS,
    topEnd: CORNER_RADIUS,
    bottomStart: CORNER_RADIUS,
    bottomEnd: CORNER_RADIUS,
  },
});

const SHADOW = {
  radius: 16,
  spread: 0,
  offsetY: 6,
  alpha: 0.18,
  color: '#000000',
} as const;

const Palette = {
  light: {
    container: 'rgba(247, 247, 247, 0.96)',
    border: { width: 1, color: 'rgba(0, 0, 0, 0.10)' },
    itemColors: {
      selectedIconColor: '#000000',
      selectedTextColor: '#000000',
      selectedIndicatorColor: '#E0E1E6',
      unselectedIconColor: '#60646C',
      unselectedTextColor: '#60646C',
    },
  },
  dark: {
    container: 'rgba(33, 34, 37, 0.93)',
    border: { width: 1, color: 'rgba(255, 255, 255, 0.12)' },
    itemColors: {
      selectedIconColor: '#FFFFFF',
      selectedTextColor: '#FFFFFF',
      selectedIndicatorColor: '#3A3D42',
      unselectedIconColor: '#B0B4BA',
      unselectedTextColor: '#B0B4BA',
    },
  },
} as const;

/** Material Symbols exported as XML vector drawables (see `assets/icons`). */
const TabIcons: Record<TabName, ImageSourcePropType> = {
  index: require('@/assets/icons/home.xml'),
  menu: require('@/assets/icons/menu.xml'),
};

export function AndroidFloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Palette[scheme];
  const labelScale = useTabLabelScale();
  const bottomPadding = insets.bottom + BOTTOM_MARGIN;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { height: SHADOW_HEADROOM + BAR_HEIGHT + bottomPadding }]}>
      <Host style={styles.host} colorScheme={scheme}>
        <Column
          modifiers={[
            fillMaxSize(),
            padding(HORIZONTAL_MARGIN, SHADOW_HEADROOM, HORIZONTAL_MARGIN, bottomPadding),
          ]}>
          <Surface
            color={colors.container}
            tonalElevation={0}
            shape={SURFACE_SHAPE}
            border={colors.border}
            modifiers={[fillMaxWidth(), height(BAR_HEIGHT), dropShadow(SHADOW_SHAPE, SHADOW)]}>
            <Row verticalAlignment="center" modifiers={[fillMaxSize(), selectableGroup()]}>
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;
                const label =
                  typeof options.tabBarLabel === 'string'
                    ? options.tabBarLabel
                    : (options.title ?? route.name);

                // Emitting `tabPress` first keeps screen-level `listeners.tabPress`
                // (preventDefault) and `useScrollToTop` working — a custom tab bar is the
                // component responsible for firing that event.
                const onClick = () => {
                  const event = emitter.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigateToTab(route.key);
                  }
                };

                return (
                  <NavigationBarItem
                    key={route.key}
                    selected={isFocused}
                    onClick={onClick}
                    colors={colors.itemColors}>
                    <NavigationBarItem.Icon>
                      <Icon
                        source={TabIcons[route.name as TabName]}
                        size={24}
                        contentDescription={label}
                      />
                    </NavigationBarItem.Icon>
                    <NavigationBarItem.Label>
                      <Text
                        style={{
                          typography: 'labelMedium',
                          fontSize: LABEL_FONT_SIZE / labelScale,
                          lineHeight: LABEL_LINE_HEIGHT / labelScale,
                        }}>
                        {label}
                      </Text>
                    </NavigationBarItem.Label>
                  </NavigationBarItem>
                );
              })}
            </Row>
          </Surface>
        </Column>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  host: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
