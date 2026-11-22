import { Column, type Icon } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { spacing, useNativeColors, useWindowLayout } from '@/shared/theme';

import { useHeroTopSpacing } from './brand-hero';
import { BrandLogoHost } from './brand-logo';
import { NativeButton } from './native-button';
import type { NativeButtonProps } from './native-button.types';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';
import { StatusHeader, type StatusTone } from './status-header';
import { SupportContactButtons } from './support-contact-buttons';

/**
 * 차단 화면의 주 버튼. 색은 화면이 고르지 않고 셸 기본(`filled` = 주 행동, `action` 빨강)을 따른다.
 * `variant`는 앞으로 다른 강조가 꼭 필요한 화면을 위한 여지일 뿐, 차단 화면끼리 어긋나게 쓰지 않는다.
 */
export type BlockingAction = Pick<NativeButtonProps, 'label' | 'onPress' | 'testID' | 'variant'>;

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
  /** 하단 고정 주 버튼(로그인 화면으로, 업데이트하기 등). 없으면 버튼 없음. */
  primaryAction?: BlockingAction;
  /** 주 버튼 위에 고객센터 연락 버튼 한 쌍(`SupportContactButtons`)을 둔다. */
  showSupport?: boolean;
};

const LOGO_HEIGHT = 32;

/**
 * 차단 화면(점검·계정 잠김·정지·필수 업데이트·보안 위험 기기·자동 로그아웃) 공용 셸 (PDF p33~42).
 *  모든 창에서 한 컬럼이다(폴더블 좌우 분할 없음, `CONTENT_MAX_WIDTH`로 가운데는 `FormColumn`이 맡음).
 *  로그인과 같은 구조: 로고 + 상태 헤더(배지·제목·설명) + 상세가 스크롤 **안**에 있고, 버튼은 아래 고정 푸터.
 *  버튼은 셸이 데이터(`showSupport`, `primaryAction`)로 직접 그린다: 화면마다 버튼 색·순서가 갈라지지 않게 한다.
 *  손쉬운 사용 글꼴에서는 푸터가 스크롤 맨 끝으로 옮겨진다(`NativeFormScroll`). 뒤로가기 차단은 화면이 `useBlockBackButton(true, 'exit')`로 한다.
 */
export function BlockingScreenLayout({ icon, tone, title, description, details, primaryAction, showSupport = false }: BlockingScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();
  const { isShort, isLargeText } = useWindowLayout();
  // 로그인 히어로와 같은 규칙: 기본 글꼴의 낮은 창(가로 폰·분할 화면)에서만 뺀다. 큰 글꼴은 어차피 스크롤하므로 보인다.
  const showLogo = !isShort || isLargeText;
  // 푸터는 있는지 여부로 고정 영역을 만들므로, 버튼이 하나도 없으면 요소 자체를 넘기지 않는다.
  const footer = primaryAction || showSupport ? <BlockingActions primaryAction={primaryAction} showSupport={showSupport} /> : undefined;

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
          footer={footer}>
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

/** 하단 버튼: 고객센터 연락(선택)이 위, 주 버튼이 아래. */
function BlockingActions({ primaryAction, showSupport }: Pick<BlockingScreenLayoutProps, 'primaryAction' | 'showSupport'>) {
  return (
    <>
      {showSupport ? <SupportContactButtons /> : null}
      {primaryAction ? <NativeButton variant="filled" {...primaryAction} /> : null}
    </>
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
