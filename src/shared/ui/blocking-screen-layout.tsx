import type { Icon } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { CONTENT_MAX_WIDTH, spacing, useNativeColors, useWindowLayout } from '@/shared/theme';

import { BrandLogo } from './brand-logo';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';
import { StatusHeader, type StatusTone } from './status-header';

type BlockingScreenLayoutProps = {
  /** 상태 배지 아이콘(`icons.<이름>`). */
  icon: ComponentProps<typeof Icon>['name'];
  /** 배지 색: 기본 회색, 업데이트·잠금은 `action`, 보안 위험은 `warning`. */
  tone?: StatusTone;
  /** 이미 번역된 제목(두 줄까지 자연스럽게 줄바꿈). */
  title: string;
  /** 이미 번역된 설명. */
  description?: string;
  /** 상세 카드(점검 시간표, 버전 비교, 가린 아이디 등). `@expo/ui` 요소. */
  details?: ReactNode;
  /** 하단 고정 버튼들(`SupportContactButtons`, `NativeButton`). `@expo/ui` 요소. */
  actions?: ReactNode;
};

const LOGO_HEIGHT = 32;

/**
 * 차단 화면(점검·계정 잠김·필수 업데이트·보안 위험 기기·자동 로그아웃) 공용 셸 (PDF p33~42).
 *  - 분할 창(`isSplit`: 펼친 iPhone Duo 가로·Galaxy Fold): 접히는 선 기준 정확히 반반. 왼쪽 `canvas`에 로고 + 상태 배지 + 제목 + 설명,
 *    오른쪽에 상세 카드(배지 높이에서 시작) + 아래 고정 버튼. 반반은 `width: '50%'`, 여백은 안쪽 View에만 준다(`BrandedLayout`과 같은 이유).
 *  - 그 외(폰·세로로 긴 넓은 창): 한 컬럼. 로고 아래 배지·제목·설명·상세가 스크롤되고 버튼은 아래 고정, `CONTENT_MAX_WIDTH`로 가운데.
 *  큰 글꼴·낮은 창에서도 잘리지 않게 양쪽 모두 네이티브 스크롤(`NativeFormScroll`)이다. 뒤로가기 차단은 화면이 `useBlockBackButton(true, 'exit')`로 한다.
 */
export function BlockingScreenLayout({ icon, tone, title, description, details, actions }: BlockingScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();
  const { isSplit, isShort, fontScale, height } = useWindowLayout();
  const showLogo = fontScale <= 1.5 && !(isShort && !isSplit);
  const header = (
    <StatusHeader
      icon={icon}
      tone={tone}
      title={title}
      body={description}
    />
  );

  if (isSplit) {
    const splitTop = Math.max(spacing.xl, Math.round(height * 0.08));
    // 오른쪽 상세 카드는 왼쪽 배지와 같은 높이에서 시작한다(디자인). 왼쪽: 로고 + 간격 + (FormColumn 위 패딩) + 배지.
    const detailsTop = showLogo ? LOGO_HEIGHT + spacing.lg : 0;
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: native.background }}>
        <View style={{ width: '50%', backgroundColor: native.canvas }}>
          <View style={{ flex: 1, paddingTop: topInset + splitTop, paddingLeft: insets.left }}>
            {showLogo ? (
              <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
                <BrandLogo height={LOGO_HEIGHT} />
              </View>
            ) : null}
            <NativeHost fill>
              <NativeFormScroll bottomInset={insets.bottom}>{header}</NativeFormScroll>
            </NativeHost>
          </View>
        </View>
        <View style={{ width: '50%' }}>
          <View style={{ flex: 1, paddingTop: topInset + splitTop + detailsTop, paddingRight: insets.right }}>
            <NativeHost fill>
              <NativeFormScroll
                bottomInset={insets.bottom}
                footer={actions}>
                {details}
              </NativeFormScroll>
            </NativeHost>
          </View>
        </View>
      </View>
    );
  }

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
      {showLogo ? (
        <View style={[column, { alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg }]}>
          <BrandLogo height={LOGO_HEIGHT} />
        </View>
      ) : null}
      <NativeHost fill>
        <NativeFormScroll
          bottomInset={insets.bottom}
          footer={actions}>
          {header}
          {details}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
