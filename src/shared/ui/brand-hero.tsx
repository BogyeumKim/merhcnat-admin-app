import { Column } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useWindowLayout } from '@/shared/theme';

import { BrandLogoHost } from './brand-logo';
import { NativeText } from './native-text';

/**
 * 헤더 없는 브랜드 화면(로그인, 차단 화면)의 첫 요소 위 여백. 모든 화면이 이 값 하나를 쓴다.
 *  넓은 창은 화면 높이의 1/10 지점부터 시작해 빈 위쪽이 답답하지 않게 한다. 그 외는 `spacing.xl`.
 *  safe area·창 컨트롤 여백(`useScreenTopInset()`)은 포함하지 않는다.
 */
export function useHeroTopSpacing(): number {
  const { isWide, height } = useWindowLayout();
  return isWide ? Math.max(spacing.xl, Math.round(height * 0.1)) : spacing.xl;
}

/**
 * 로그인 히어로(로고 + 문구)를 폼 스크롤 **안** 첫 요소로 그린다(`@expo/ui` 트리).
 *  큰 글꼴에서도 숨기지 않고 폼과 함께 스크롤된다. 로고는 장식 크기 고정(글꼴 배율 무시), 문구는 시스템 글꼴을 따라 줄바꿈한다.
 *  위아래 여백은 스크롤 밖에 고정하던 이전 배치와 같다(`FormColumn` 위 패딩·간격 `md`를 빼서 맞춤): 기본 글꼴 화면 높이 그대로.
 */
export function BrandHero({ tagline }: { tagline: boolean }) {
  const { t } = useTranslation();
  const { isWide } = useWindowLayout();
  const heroTop = useHeroTopSpacing();
  const logoHeight = tagline ? (isWide ? 44 : 36) : 24;

  return (
    <Column
      alignment="start"
      spacing={spacing.md}
      style={{
        width: '100%',
        paddingTop: heroTop - spacing.md,
        // 이전: 히어로 아래 패딩 + 폼 위 패딩(md). 지금은 그 사이가 컬럼 간격(md)이라 같은 값이 된다.
        paddingBottom: tagline ? spacing.lg : 0,
      }}>
      <BrandLogoHost height={logoHeight} />
      {tagline ? (
        <Column style={{ width: '100%' }}>
          <NativeText variant="title">{t('auth.tagline')}</NativeText>
        </Column>
      ) : null}
    </Column>
  );
}
