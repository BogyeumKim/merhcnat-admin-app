import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { colors, spacing, useWindowLayout } from '@/shared/theme';

import { AppText } from './app-text';
import { BrandLogo } from './brand-logo';

/** Cap for the form column so it never stretches across a tablet or an unfolded foldable. */
const FORM_MAX_WIDTH = 480;

/**
 * Responsive shell for pre-login screens. Layout follows the window, not the device:
 * - two panes (brand | form) for wide windows in landscape and for expanded widths (unfolded foldables, tablets)
 * - one column otherwise, with the logo hidden when vertical room is scarce (short windows, very large system text)
 * `children` must be an `@expo/ui` Host that scrolls itself and handles the keyboard natively.
 */
export function BrandedLayout({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const { isTwoPane, isShort, fontScale } = useWindowLayout();
  const { t } = useTranslation();

  if (isTwoPane) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        {/* Scrollable: at the largest system text sizes the brand pane can be taller than a landscape phone. */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.xl,
            paddingTop: insets.top + spacing.xl,
            paddingLeft: insets.left + spacing.xl,
          }}>
          <BrandLogo height={isShort ? 40 : 64} />
          {fontScale <= 1.5 ? (
            <AppText variant="headline" tone="secondary" style={{ textAlign: 'center' }}>
              {t('auth.tagline')}
            </AppText>
          ) : null}
        </ScrollView>
        <View style={{ flex: 1, maxWidth: FORM_MAX_WIDTH + spacing.xxl, paddingTop: insets.top, paddingRight: insets.right }}>
          {children}
        </View>
      </View>
    );
  }

  const showLogo = !isShort && fontScale <= 1.5;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {showLogo ? (
        <View style={{ alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
          <BrandLogo height={44} />
        </View>
      ) : null}
      <View style={{ flex: 1, width: '100%', maxWidth: FORM_MAX_WIDTH, alignSelf: 'center' }}>{children}</View>
    </View>
  );
}
