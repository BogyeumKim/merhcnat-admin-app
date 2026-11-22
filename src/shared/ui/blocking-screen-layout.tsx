import { Column, type Icon } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { spacing, useNativeColors, useWindowLayout } from '@/shared/theme';

import { useHeroTopSpacing } from './brand-hero';
import { BrandLogoHost } from './brand-logo';
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
 * 차단 화면(점검·계정 잠김·정지·필수 업데이트·보안 위험 기기·자동 로그아웃) 공용 셸 (PDF p33~42).
 *  모든 창에서 한 컬럼이다(폴더블 좌우 분할 없음, `CONTENT_MAX_WIDTH`로 가운데는 `FormColumn`이 맡음).
 *  로그인과 같은 구조: 로고 + 상태 헤더(배지·제목·설명) + 상세가 스크롤 **안**에 있고, 버튼(`actions`)은 아래 고정 푸터.
 *  손쉬운 사용 글꼴에서는 푸터가 스크롤 맨 끝으로 옮겨진다(`NativeFormScroll`). 뒤로가기 차단은 화면이 `useBlockBackButton(true, 'exit')`로 한다.
 */
export function BlockingScreenLayout({ icon, tone, title, description, details, actions }: BlockingScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();
  const { isShort, isLargeText } = useWindowLayout();
  // 로그인 히어로와 같은 규칙: 기본 글꼴의 낮은 창(가로 폰·분할 화면)에서만 뺀다. 큰 글꼴은 어차피 스크롤하므로 보인다.
  const showLogo = !isShort || isLargeText;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: native.background,
        paddingTop: topInset,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      <NativeHost fill>
        <NativeFormScroll
          bottomInset={insets.bottom}
          footer={actions}>
          {showLogo ? <BlockingLogo /> : null}
          <StatusHeader
            icon={icon}
            tone={tone}
            title={title}
            body={description}
          />
          {details}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}

/** 스크롤 안 첫 요소인 로고. 위 여백은 로그인 히어로와 같은 `useHeroTopSpacing()`. */
function BlockingLogo() {
  const heroTop = useHeroTopSpacing();

  return (
    // 위: `FormColumn` 위 패딩(md)을 빼서 로그인 히어로와 같은 시작 높이. 아래: 컬럼 간격(md) + sm = 이전 로고~배지 간격.
    <Column style={{ width: '100%', paddingTop: heroTop - spacing.md, paddingBottom: spacing.sm }}>
      <BrandLogoHost height={LOGO_HEIGHT} />
    </Column>
  );
}
