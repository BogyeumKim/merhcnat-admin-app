import { Column, Row, Spacer } from '@expo/ui';
import type { ReactNode } from 'react';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

const BAR_HEIGHT = 4;
const BAR_GAP = 4;

type StepBarsProps = {
  current: number;
  total: number;
  /** 막대 앞에 둘 컨트롤(코드 단계의 뒤로 버튼). */
  leading?: ReactNode;
  /** 단계 라벨 뒤에 둘 컨트롤(시트 닫기 X). */
  trailing?: ReactNode;
};

/**
 * "1 / 2단계": 같은 길이의 막대가 남는 폭을 나눠 채운다(완료된 막대는 action 색). Korpay 디자인과 동일.
 * 막대는 유연한 `Spacer`(iOS SwiftUI `Spacer`, Android `weight(1)`)라 단계 라벨과 앞뒤 버튼이 먼저 자연 폭을 받고
 * 막대가 나머지를 나눠 갖는다. 창 폭이나 글자 폭을 추정해 빼지 않으므로 언어·시스템 글꼴 크기·시트 폭이 바뀌어도
 * 라벨이 줄바꿈되거나 막대가 시트 밖으로 넘치지 않는다.
 */
export function StepBars({ current, total, leading, trailing }: StepBarsProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Row alignment="center" spacing={BAR_GAP} style={{ width: '100%' }}>
      {leading}
      {Array.from({ length: total }, (_, index) => (
        <Spacer
          key={index}
          flexible
          style={{
            height: BAR_HEIGHT,
            borderRadius: radius.sm / 4,
            backgroundColor: index < current ? colors.action : colors.hairline,
          }}
        />
      ))}
      <Column style={{ paddingLeft: spacing.sm }}>
        <NativeText variant="caption" tone="secondary">
          {t('auth.verify.step', { current, total })}
        </NativeText>
      </Column>
      {trailing}
    </Row>
  );
}
