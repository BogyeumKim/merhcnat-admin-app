import {
  Box,
  Button,
  CircularProgressIndicator,
  FilledTonalButton,
  OutlinedButton,
  Row,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import {
  alpha,
  defaultMinSize,
  fillMaxWidth,
  onSizeChanged,
  semantics,
  size,
  testID as testIDModifier,
} from '@expo/ui/jetpack-compose/modifiers';

import { spacing, useNativeColors } from '@/shared/theme';

import { BUTTON_CONTENT_PADDING_HORIZONTAL, BUTTON_CONTENT_PADDING_VERTICAL, BUTTON_MIN_HEIGHT } from './native-button-metrics';
import type { NativeButtonProps } from './native-button.types';

/**
 * 56dp: Korpay 디자인 pill 버튼 높이 (Material 최소 터치 영역 48dp보다 큼). 고정 `height`가 아니라 최소 높이다:
 * 큰 글꼴에서 라벨이 두 줄이 되면 버튼이 늘어난다(고정 56이면 두 번째 줄이 잘렸다, font_scale 2.0 실측).
 */
const FULL_WIDTH = [fillMaxWidth(), defaultMinSize({ minHeight: BUTTON_MIN_HEIGHT })];
/** Material 기본값과 같은 안쪽 여백을 명시한다(나란한 버튼 높이 맞춤 계산의 기준, `native-button-metrics`). */
const CONTENT_PADDING = {
  start: BUTTON_CONTENT_PADDING_HORIZONTAL,
  end: BUTTON_CONTENT_PADDING_HORIZONTAL,
  top: BUTTON_CONTENT_PADDING_VERTICAL,
  bottom: BUTTON_CONTENT_PADDING_VERTICAL,
} as const;
/** 로딩 중에도 라벨을 투명하게 남겨 버튼 크기가 바뀌지 않게 한다(스피너는 가운데 겹침). */
const HIDDEN = [alpha(0)];
/**
 * 로딩이 끝나면 빈 배열로 되돌린다. `undefined`로 바꾸면 Fabric이 prop 제거로 `null`을 보내고, Compose 뷰의
 *  `modifiers`(non-null 리스트)가 null을 변환하지 못해 "Cannot set prop 'modifiers'" 오류가 난다.
 *  jetpack-compose 컴포넌트(`Box`/`Row` 등)에는 조건부 `undefined` 대신 항상 배열을 넘긴다.
 */
const VISIBLE: typeof HIDDEN = [];
const SPINNER = [size(20, 20)];
const LEADING_GAP = { spacedBy: spacing.sm } as const;
const noop = () => {};

/**
 * Material 3 버튼 (Android). 브랜드 `action` 색을 명시적으로 지정한다. 범용 `Button`은 Host가 생성한 Material 색상표에서
 *  색을 가져오는데, 빨간 시드는 브랜드 레드가 아닌 칙칙한 갈색 primary가 되기 때문이다.
 *  비활성 색은 Material 기본값을 그대로 쓴다 (회색 컨테이너, 38% 콘텐츠).
 *  `loading`: 활성 색을 유지한 채 `CircularProgressIndicator`를 보이고 클릭은 무시한다.
 */
export function NativeButton({
  label,
  onPress,
  variant = 'filled',
  disabled,
  loading = false,
  leading,
  accessibilityLabel,
  testID,
  equalHeight,
}: NativeButtonProps) {
  const colors = useNativeColors();
  // 나란한 짝 버튼(`useEqualButtonHeights`): 가장 높은 짝에 맞춘 최소 높이. 56보다 작아지지는 않는다.
  const minHeight = equalHeight?.minHeight;
  const onContentHeight = equalHeight?.onContentHeight;
  const modifiers = [
    ...(minHeight && minHeight > BUTTON_MIN_HEIGHT ? [fillMaxWidth(), defaultMinSize({ minHeight })] : FULL_WIDTH),
    ...(testID ? [testIDModifier(testID)] : []),
    ...(accessibilityLabel ? [semantics({ contentDescription: accessibilityLabel })] : []),
  ];
  const common = { onClick: disabled ? undefined : loading ? noop : onPress, enabled: !disabled, modifiers };
  const padded = { ...common, contentPadding: CONTENT_PADDING };
  const contentColor =
    variant === 'tonal' ? colors.text : variant === 'ink' ? colors.background : variant === 'filled' ? colors.onAction : colors.action;
  const content = (
    <Box
      contentAlignment="center"
      modifiers={onContentHeight ? [onSizeChanged(({ height }) => onContentHeight(height))] : VISIBLE}>
      <Row
        verticalAlignment="center"
        horizontalArrangement={LEADING_GAP}
        modifiers={loading ? HIDDEN : VISIBLE}>
        {leading ?? null}
        <Text>{label}</Text>
      </Row>
      {loading ? (
        <CircularProgressIndicator
          color={contentColor}
          strokeWidth={2}
          modifiers={SPINNER}
        />
      ) : null}
    </Box>
  );

  if (variant === 'tonal') {
    return (
      <FilledTonalButton {...padded} colors={{ containerColor: colors.tonal, contentColor: colors.text }}>
        {content}
      </FilledTonalButton>
    );
  }
  if (variant === 'ink') {
    return (
      <Button {...padded} colors={{ containerColor: colors.ink, contentColor: colors.background }}>
        {content}
      </Button>
    );
  }
  if (variant === 'outlined') {
    return (
      <OutlinedButton {...padded} colors={{ contentColor: colors.action }}>
        {content}
      </OutlinedButton>
    );
  }
  if (variant === 'text') {
    return (
      <TextButton {...common} colors={{ contentColor: colors.action }}>
        {content}
      </TextButton>
    );
  }
  return (
    <Button {...padded} colors={{ containerColor: colors.action, contentColor: colors.onAction }}>
      {content}
    </Button>
  );
}
