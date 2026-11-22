import { Column, type Icon } from '@expo/ui';
import type { ComponentProps, ReactNode } from 'react';

import { spacing } from '@/shared/theme';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';
import { StatusHeader } from '@/shared/ui/status-header';

import { StepBars } from './step-bars';

type IconName = ComponentProps<typeof Icon>['name'];

/**
 * 인증 단계의 상단: 선택적 진행 막대, 선택적 아이콘 배지, 제목, 한 줄 설명.
 * `icon`이 없으면 디자인의 기본 시트 헤더(막대, 두 줄 제목, 조용한 본문)가 된다.
 */
export function StepHeader({
  title,
  body,
  icon,
  step,
  trailing,
}: {
  title: string;
  body: string;
  icon?: IconName | 'shield';
  step?: { current: number; total: number };
  /** 진행 막대 줄 끝 컨트롤(시트 닫기 X). `step`이 있을 때만 그린다. */
  trailing?: ReactNode;
}) {
  const resolved: IconName | undefined = icon === 'shield' ? icons.shieldLock : icon;
  const bars = step ? <StepBars current={step.current} total={step.total} trailing={trailing} /> : null;

  if (!resolved) {
    return (
      <Column spacing={spacing.sm} style={{ width: '100%' }}>
        {bars}
        <NativeText variant="title">{title}</NativeText>
        <NativeText tone="secondary">{body}</NativeText>
      </Column>
    );
  }
  return (
    <Column spacing={spacing.sm} style={{ width: '100%' }}>
      {bars}
      <StatusHeader icon={resolved} title={title} body={body} />
    </Column>
  );
}
