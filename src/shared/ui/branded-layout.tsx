import { Column } from '@expo/ui';
import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { useKeyboardVisible } from '@/shared/lib/use-keyboard-visible';
import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { CONTENT_MAX_WIDTH, spacing, useNativeColors, useWindowLayout } from '@/shared/theme';

import { BrandLogo } from './brand-logo';
import { NativeHost } from './native-host';
import { NativeText } from './native-text';

/**
 * 로그인 전 화면의 반응형 셸.
 *  - 좌우 분할(`isSplit`, 디자인: 펼친 iPhone Duo 가로·Galaxy Fold): 왼쪽 `canvas` 영역에 로고와 문구, 오른쪽에 폼.
 *    접히는 선이 가운데라 정확히 반씩 나눠 어떤 요소도 접히는 선을 넘지 않는다. 키보드가 올라와도 왼쪽 브랜드는 보인다.
 *  - 넓지만 세로로 긴 창(태블릿·펼친 Duo 세로)에서는 한 컬럼을 `CONTENT_MAX_WIDTH`로 가운데 두고 위쪽 여백을 늘린다.
 *  - 세로 공간이 부족하면(낮은 창, 매우 큰 시스템 글자, 키보드) 로고와 제목을 숨긴다.
 *  접기/펼치기를 오가도 구조가 같아 입력 중인 텍스트가 유지된다.
 *  `children`은 스스로 스크롤하고 키보드를 네이티브로 처리하는 `@expo/ui` Host여야 한다.
 */
export function BrandedLayout({
  children,
  tagline = false,
  bottomNote,
}: PropsWithChildren<{ tagline?: boolean; bottomNote?: ReactNode }>) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();
  const { isWide, isSplit, isShort, height, fontScale } = useWindowLayout();
  const { t } = useTranslation();
  const keyboardVisible = useKeyboardVisible();

  if (isSplit) {
    // 두 영역의 첫 요소(로고, 첫 입력란)를 같은 높이에서 시작한다(디자인). 키보드가 있으면 폼 쪽 여백을 줄인다.
    const splitTop = Math.max(spacing.xl, Math.round(height * 0.18));
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: native.background }}>
        {/*
          두 영역은 창 폭의 정확히 50%(`width: '50%'`)다. `flex: 1`끼리 나누면 Yoga가 flex-basis 0을 각 영역의 패딩 합 이상으로
          올려 잡아, 패딩이 큰 왼쪽 영역이 그만큼 더 넓어졌다(펼친 Fold 실측 54%: 816dp 중 440dp, 접히는 선이 폼 쪽을 가로지름).
          그래서 바깥 영역에는 패딩을 두지 않고, safe area·여백은 안쪽 View에만 준다.
        */}
        <View style={{ width: '50%', backgroundColor: native.canvas }}>
          <View
            style={{
              flex: 1,
              paddingTop: topInset + splitTop,
              paddingLeft: insets.left + spacing.xl,
              paddingRight: spacing.xl,
              gap: spacing.md,
            }}>
            {fontScale <= 1.5 ? <BrandLogo height={44} /> : null}
            {tagline ? (
              <NativeHost>
                <Column style={{ width: '100%' }}>
                  <NativeText variant="title">{t('auth.tagline')}</NativeText>
                </Column>
              </NativeHost>
            ) : null}
          </View>
        </View>
        <View style={{ width: '50%' }}>
          <View style={{ flex: 1, paddingTop: topInset + (keyboardVisible ? spacing.md : splitTop - spacing.md), paddingRight: insets.right }}>
            {/* 폼 Host는 오른쪽 영역 전체 폭을 쓰고, 안쪽 `FormColumn`이 최대 폭으로 가운데 정렬한다. */}
            <View style={{ flex: 1, width: '100%' }}>{children}</View>
            {bottomNote && !keyboardVisible ? (
              <View style={{ paddingBottom: insets.bottom + spacing.md }}>
                <NativeHost>{bottomNote}</NativeHost>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  const showLogo = !isShort && fontScale <= 1.5;
  // 넓고 높은 창에서는 히어로를 화면 위쪽 1/10 지점부터 시작해 빈 위쪽이 답답하지 않게 한다.
  const heroTop = isWide ? Math.max(spacing.xl, Math.round(height * 0.1)) : spacing.xl;
  const column = { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' } as const;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: native.background,
        paddingTop: topInset,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {/* 키보드가 올라와 있는 동안 로그인 히어로는 자리를 입력 필드에 양보한다 (닫히면 로고와 제목이 돌아온다). */}
      {showLogo && !(tagline && keyboardVisible) ? (
        tagline ? (
          // 로그인 히어로 (Korpay 디자인): 워드마크와 두 줄 제목을 아래 폼처럼 왼쪽 정렬한다.
          <View style={[column, { alignItems: 'flex-start', gap: spacing.md, paddingTop: heroTop, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg }]}>
            <BrandLogo height={isWide ? 44 : 36} />
            <NativeHost>
              <Column style={{ width: '100%' }}>
                <NativeText variant="title">{t('auth.tagline')}</NativeText>
              </Column>
            </NativeHost>
          </View>
        ) : (
          <View style={[column, { alignItems: 'flex-start', paddingTop: heroTop, paddingBottom: spacing.md, paddingHorizontal: spacing.lg }]}>
            <BrandLogo height={24} />
          </View>
        )
      ) : null}
      {/* 폼 Host는 창 전체 폭을 쓰고, 안쪽 `FormColumn`이 같은 최대 폭으로 가운데 정렬한다(히어로와 왼쪽 선이 맞는다). */}
      <View style={{ flex: 1, width: '100%' }}>{children}</View>
      {bottomNote && !keyboardVisible ? (
        // 폼 아래, 키보드 인식 스크롤 밖에 둔다. 키보드와 함께 사라진다: Android에서는 폼 자체의 `imePadding()`과
        // 이 블록의 공간이 같은 화면에서 이중으로 차감되어, 푸터 버튼이 화면 중간에 뜨고 오류 메시지가 그 뒤에 잘렸기 때문이다.
        <View style={{ paddingBottom: insets.bottom + spacing.md }}>
          <NativeHost>{bottomNote}</NativeHost>
        </View>
      ) : null}
    </View>
  );
}
