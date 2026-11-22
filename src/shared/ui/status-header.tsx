import { Column, Icon, Spacer } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';

import { spacing, useNativeColors } from '@/shared/theme';

import { NativeText } from './native-text';

type IconName = ComponentProps<typeof Icon>['name'];

const BADGE = 56;
const ICON = 28;

/**
 * 단계 또는 상태 화면의 상단: 둥근 아이콘 배지, 굵은 두 줄 제목, 한 줄 설명 (Korpay 디자인 레이아웃으로
 *  잠금, 렌치, 다운로드, 방패 화면이 모두 공유). `tone`이 배지 색을 정한다 (기본 회색, 액션/잠금은 분홍 + 빨강, 주의는 호박색).
 *  배지는 고정 정사각형이며 아이콘은 flexible spacer로 가운데 정렬하므로, 키가 크거나 넓은 글리프(잠금, 렌치)도 타원으로 늘어나지 않는다.
 */
type Tone = 'neutral' | 'action' | 'warning' | 'danger';

export function StatusHeader({ icon, title, body, children, tone = 'neutral' }: { icon?: IconName; title: string; body?: string; children?: ReactNode; tone?: Tone }) {
  const colors = useNativeColors();
  const badge = { neutral: [colors.tonal, colors.ink], action: [colors.actionSurface, colors.action], warning: [colors.warningSurface, colors.warning], danger: [colors.dangerSurface, colors.danger] }[tone];

  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      {icon ? (
        <Column alignment="center" style={{ width: BADGE, height: BADGE, borderRadius: BADGE / 2, backgroundColor: badge[0] }}>
          <Spacer flexible />
          <Icon name={icon} size={ICON} color={badge[1]} />
          <Spacer flexible />
        </Column>
      ) : null}
      {children}
      <NativeText variant="title">{title}</NativeText>
      {body ? <NativeText tone="secondary">{body}</NativeText> : null}
    </Column>
  );
}
