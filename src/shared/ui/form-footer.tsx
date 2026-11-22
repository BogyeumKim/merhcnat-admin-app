import type { PropsWithChildren } from 'react';

import { spacing } from '@/shared/theme';

import { ContentColumn } from './form-column';

/** 하단 고정 액션의 컨테이너: 폼과 같은 폭·좌우 여백(넓은 창에서는 가운데 정렬), 위아래 여유 공간. */
export function FormFooter({ children, bottomPadding }: PropsWithChildren<{ bottomPadding: number }>) {
  return (
    <ContentColumn spacing={spacing.sm} paddingTop={spacing.sm} paddingBottom={bottomPadding}>
      {children}
    </ContentColumn>
  );
}
