import { Button, Column, Row, Text } from '@expo/ui';
import { ProgressView, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel as accessibilityLabelModifier,
  buttonBorderShape,
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  opacity,
  tint,
} from '@expo/ui/swift-ui/modifiers';

import { spacing, useNativeColors } from '@/shared/theme';

import type { NativeButtonProps } from './native-button.types';

/** 라벨을 버튼이 받은 너비만큼 늘린다. 버튼 스타일이 배경을 전체 너비로 그린다. */
const FILL_WIDTH = frame({ maxWidth: Infinity });
/** Korpay 디자인 버튼처럼 pill 모양 (높이 56pt, 완전 둥근 모서리). */
const SHAPE = buttonBorderShape('capsule');
/** 17pt Semibold 라벨 (Dynamic Type 적용): 기본 Regular 굵기는 채워진 버튼 안에서 얇아 보인다. */
const LABEL = font({ textStyle: 'headline' });
/** 12pt: 버튼 스타일이 자체로 약 11pt를 더하므로 17pt 라벨이면 높이가 약 57pt가 된다 (디자인은 56). */
const LABEL_PADDING = spacing.sm + spacing.xs;
const TONAL_STYLE = buttonStyle('bordered');
const LABEL_FRAME = [FILL_WIDTH];
/** 나란한 짝 버튼(`useEqualButtonHeights`): 행이 정한 높이까지 라벨 프레임을 세로로도 늘린다(배경은 라벨 프레임을 따라 그려진다). */
const LABEL_FRAME_FILL = [frame({ maxWidth: Infinity, maxHeight: Infinity })];
const LABEL_STYLE = { paddingVertical: LABEL_PADDING } as const;
const FULL_WIDTH_STYLE = { width: '100%' } as const;
/** 로딩 중에도 라벨을 투명하게 남겨 버튼 높이·폭이 바뀌지 않게 한다(스피너는 그 위에 겹친다). */
const HIDDEN = opacity(0);
const noop = () => {};

/**
 * 일반 SwiftUI 버튼은 라벨 높이(약 22pt)뿐이라 최소 터치 영역 44pt에 못 미친다. 패딩을 라벨 안쪽에 넣어 눌림 영역에 포함시킨다.
 *  라벨에는 `fontSize`/색이 없고 Dynamic Type과 tint를 따른다.
 *  라벨은 SwiftUI `Button` 안에 있어 퍼센트 너비가 해석되지 않으므로(콘텐츠 크기로 남음),
 *  `width: '100%'` 대신 SwiftUI flexible frame으로 너비를 채운다.
 *  `loading`: 비활성(회색)으로 바꾸지 않고 같은 색 버튼 안에 `ProgressView`를 보이며 탭은 무시한다.
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
  const shapeModifiers =
    variant === 'text' ? [] : variant === 'tonal' ? [SHAPE, TONAL_STYLE, tint(colors.ink)] : variant === 'ink' ? [SHAPE, tint(colors.ink)] : [SHAPE];
  const buttonModifiers = accessibilityLabel ? [...shapeModifiers, accessibilityLabelModifier(accessibilityLabel)] : shapeModifiers;
  const contentColor =
    variant === 'ink' ? colors.background : variant === 'filled' ? colors.onAction : variant === 'tonal' ? colors.ink : colors.action;
  const labelModifiers = variant === 'ink' ? [LABEL, foregroundStyle(colors.background)] : [LABEL];
  const text = <Text modifiers={labelModifiers}>{label}</Text>;
  const content = leading ? (
    <Row
      alignment="center"
      spacing={spacing.sm}>
      {leading}
      {text}
    </Row>
  ) : (
    text
  );

  return (
    <Button
      variant={variant === 'tonal' || variant === 'ink' ? 'filled' : variant}
      disabled={disabled}
      onPress={loading ? noop : onPress}
      testID={testID}
      modifiers={buttonModifiers}
      style={FULL_WIDTH_STYLE}>
      <Column
        alignment="center"
        modifiers={equalHeight?.fill ? LABEL_FRAME_FILL : LABEL_FRAME}
        style={LABEL_STYLE}>
        <ZStack>
          <Column modifiers={loading ? [HIDDEN] : undefined}>{content}</Column>
          {loading ? <ProgressView modifiers={[tint(contentColor)]} /> : null}
        </ZStack>
      </Column>
    </Button>
  );
}
