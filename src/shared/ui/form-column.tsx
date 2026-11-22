import { Column } from '@expo/ui';
import type { PropsWithChildren } from 'react';

import { spacing } from '@/shared/theme';

import { useContentWidthModifiers } from './content-width';

type ContentColumnProps = PropsWithChildren<{
  spacing: number;
  paddingTop: number;
  paddingBottom: number;
}>;

/**
 * 부모(스크롤 뷰포트·시트) 실제 폭 안에서 `CONTENT_MAX_WIDTH`(좌우 여백 포함) 컬럼을 가운데 둔다.
 *  1) 바깥: 부모 폭을 채우고 가운데 정렬. 2) 가운데: 최대 폭 제한만(패딩 없음). 3) 안쪽: 그 폭을 채우고 좌우 `lg` 여백.
 *  최대 폭과 패딩을 다른 층에 두는 이유: Android 범용 `style` 패딩은 사용자 모디파이어(`width`)보다 바깥에 붙어
 *  같은 층에 두면 컬럼이 528 + 패딩으로 넓어진다(iOS는 패딩이 프레임 안쪽). 층을 나눠 두 플랫폼 모두 528 안에 여백이 들어간다.
 *  부모가 최대 폭보다 좁으면(폰) 가운데 층이 부모 폭이 되어 여백만 남는다. 창 폭으로 계산하지 않는다.
 */
export function ContentColumn({ children, spacing: gap, paddingTop, paddingBottom }: ContentColumnProps) {
  const widthModifiers = useContentWidthModifiers();

  return (
    <Column alignment="center" style={{ width: '100%' }}>
      <Column modifiers={widthModifiers} style={{ width: '100%' }}>
        <Column spacing={gap} style={{ width: '100%', paddingHorizontal: spacing.lg, paddingTop, paddingBottom }}>
          {children}
        </Column>
      </Column>
    </Column>
  );
}

/**
 * 폼의 콘텐츠 컬럼. 넓은 창(펼친 폴더블, 태블릿)과 넓은 시트에서는 `CONTENT_MAX_WIDTH`로 가운데 정렬한다.
 * 패딩은 의도적으로 네이티브 스크롤 뷰 안쪽에 둔다: 스크롤 뷰 자체에 패딩을 주면 스크롤 영역 밖이 되어 콘텐츠가 잘린다.
 */
export function FormColumn({ children, bottomPadding }: PropsWithChildren<{ bottomPadding: number }>) {
  return (
    <ContentColumn spacing={spacing.md} paddingTop={spacing.md} paddingBottom={bottomPadding}>
      {children}
    </ContentColumn>
  );
}
