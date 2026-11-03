import { Column, RNHostView, Spacer } from '@expo/ui';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { colors, spacing, useWindowLayout } from '@/shared/theme';

import { BrandLogo } from './brand-logo';
import { NativeHost } from './native-host';
import { NativeText } from './native-text';

/** Cap for the form column so it never stretches across a tablet or an unfolded foldable. */
const FORM_MAX_WIDTH = 480;

/**
 * Responsive shell for pre-login screens. Layout follows the window, not the device:
 * - two panes (brand | form) for wide windows in landscape and for expanded widths (unfolded foldables, tablets)
 * - one column otherwise, with the logo hidden when vertical room is scarce (short windows, very large system text)
 * `children` must be an `@expo/ui` Host that scrolls itself and handles the keyboard natively.
 */
export function BrandedLayout({
  children,
  tagline = false,
  bottomNote,
}: PropsWithChildren<{ tagline?: boolean; bottomNote?: string }>) {
  const insets = useSafeAreaInsets();
  const { isTwoPane, isShort, fontScale } = useWindowLayout();
  const { t } = useTranslation();

  if (isTwoPane) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
        {/* Native brand pane. It does not scroll: the tagline is dropped at large system text and the logo shrinks in short windows. */}
        <View style={{ flex: 1, paddingTop: insets.top, paddingLeft: insets.left }}>
          <NativeHost fill>
            <Column alignment="center" spacing={spacing.md} style={{ width: '100%', height: '100%', padding: spacing.xl }}>
              <Spacer flexible />
              <RNHostView matchContents>
                <BrandLogo height={isShort ? 36 : 52} />
              </RNHostView>
              {fontScale <= 1.5 ? (
                <NativeText variant="headline" tone="secondary" center>
                  {t('auth.tagline')}
                </NativeText>
              ) : null}
              <Spacer flexible />
            </Column>
          </NativeHost>
        </View>
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
        tagline ? (
          // Sign-in hero (Korpay design): the wordmark and a two-line title, both left-aligned like the form under them.
          <View style={{ alignItems: 'flex-start', gap: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }}>
            <BrandLogo height={36} />
            <NativeHost>
              <Column style={{ width: '100%' }}>
                <NativeText variant="title">{t('auth.tagline')}</NativeText>
              </Column>
            </NativeHost>
          </View>
        ) : (
          <View style={{ alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: spacing.md, paddingHorizontal: spacing.lg }}>
            <BrandLogo height={44} />
          </View>
        )
      ) : null}
      <View style={{ flex: 1, width: '100%', maxWidth: FORM_MAX_WIDTH, alignSelf: 'center' }}>{children}</View>
      {bottomNote ? (
        // Under the form, outside its keyboard-aware scroll: the keyboard simply covers it.
        <View style={{ paddingBottom: insets.bottom + spacing.md }}>
          <NativeHost>
            <Column alignment="center" style={{ width: '100%' }}>
              <NativeText variant="caption" tone="secondary" center>
                {bottomNote}
              </NativeText>
            </Column>
          </NativeHost>
        </View>
      ) : null}
    </View>
  );
}
