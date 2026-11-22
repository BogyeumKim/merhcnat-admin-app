import { Row } from '@expo/ui';

import { radius, spacing, useNativeColors } from '@/shared/theme';

import { DecorativeIcon } from './decorative-icon';
import { icons } from './icons';
import { NativeText } from './native-text';

/** 아이콘과 메시지 크기를 함께 맞춰 심볼이 첫 줄에 오도록 한다. */
const ICON_SIZE = 18;

/**
 * 지속되는 폼 단위 오류 (예: "아이디 또는 비밀번호가 올바르지 않습니다"). 토스트와 달리 사용자가 조치할 때까지 남는다.
 *  일부러 박스로 만들지 않았다: 작은 아이콘 + danger 색 메시지. 아이콘과 문구가 의미를 전달하므로 색에만 의존하지 않는다.
 *  `boxed`는 옅은 색의 둥근 카드(시트 안의 실패한 액션, 위쪽 채널 카드와 같은 모양)에 같은 패딩으로 올린다.
 */
export function FormAlert({ message, boxed = false }: { message: string; boxed?: boolean }) {
  const colors = useNativeColors();

  return (
    <Row
      alignment="start"
      spacing={spacing.sm}
      style={
        boxed
          ? { width: '100%', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.dangerSurface }
          : { width: '100%', paddingVertical: spacing.xs }
      }>
      <DecorativeIcon name={icons.error} size={ICON_SIZE} color={colors.danger} />
      <NativeText variant="subhead" tone="danger">
        {message}
      </NativeText>
    </Row>
  );
}
