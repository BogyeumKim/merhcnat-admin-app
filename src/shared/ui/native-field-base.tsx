import { Column, Row, TextInput, type TextInputRef } from '@expo/ui';
import { useEffect, useRef, useState, type Ref } from 'react';

import { forgetField, markFieldFocused } from '@/shared/lib/focused-field';
import { radius, spacing, useNativeColors } from '@/shared/theme';

import type { NativeFieldProps } from './native-field.types';

type NativeFieldBaseProps = NativeFieldProps & {
  /** 행 안쪽 입력에 적용할 플랫폼 modifier (Android는 행을 채우려면 `weight(1)`이 필요). */
  inputModifiers?: NativeFieldProps['modifiers'];
  /** 박스 행에 적용할 플랫폼 modifier: 모든 필드 높이가 같도록 하는 최소 높이. */
  rowModifiers?: NativeFieldProps['modifiers'];
  /**
   * iOS는 링을 직접 그린다: 박스에 `strokeBorder`를 쓴다 (링용 `Column`으로 감싸면 최소 높이 frame 사이로 두꺼운 띠로 비친다).
   *  현재 링 색에 맞는 modifier를 반환한다.
   */
  ringModifiers?: (ringColor: string, fillColor: string) => NativeFieldProps['modifiers'];
};

/** Korpay 디자인에서 박스 높이는 56 (플랫폼 파일이 최소 높이를 지정), 링은 1.5. */
const RING = 1.5;
const RADIUS = radius.lg;

/** 바깥에서 받은 ref(콜백 또는 객체)에 입력란 인스턴스를 넘긴다. */
function assignRef(ref: Ref<TextInputRef> | undefined, instance: TextInputRef | null) {
  if (typeof ref === 'function') ref(instance);
  else if (ref) ref.current = instance;
}

/**
 * 박스형 필드, Korpay 디자인: 기본은 옅은 색의 둥근 박스, 포커스 시 흰색 + 1.5 ink 링, 오류 시 흰색 + danger 링
 *  (색에만 의존하지 않음: 아래 메시지에 아이콘이 있다). Android는 박스를 감싼 링 색의 둥근 `Column`, iOS는 `ringModifiers`의
 *  `strokeBorder`로 링을 그린다 (`borderWidth` + `borderRadius` 조합은 iOS에서 테두리가 잘린다). `fontSize` 없음: 글자는 시스템 글자 크기를 따른다.
 *  여기서 유지하는 상태는 포커스 boolean뿐이며 텍스트는 절대 보관하지 않는다.
 */
export function NativeFieldBase({
  style,
  textStyle,
  invalid = false,
  trailing,
  onFocus,
  onBlur,
  inputModifiers,
  rowModifiers,
  ringModifiers,
  ref,
  ...props
}: NativeFieldBaseProps) {
  const colors = useNativeColors();
  const [focused, setFocused] = useState(false);
  // 포커스 레지스트리(`shared/lib/focused-field`)용: 시트를 띄우기 전에 이 입력란을 블러할 수 있게 한다.
  // 핸들은 마운트 동안 고정: ref 콜백은 렌더마다 null → 인스턴스로 다시 불리므로 거기서 등록을 지우면 포커스 중에 레지스트리가 비워진다.
  const inputRef = useRef<TextInputRef | null>(null);
  const [handle] = useState(() => ({ blur: () => inputRef.current?.blur() }));
  // 등록을 지우는 곳은 실제 블러(`onBlur`)와 언마운트뿐이다.
  useEffect(() => () => forgetField(handle), [handle]);
  const ring = invalid ? colors.danger : focused ? colors.text : colors.field;

  const fill = focused || invalid ? colors.card : colors.field;

  const box = (
    <Row
      alignment="center"
      spacing={spacing.sm}
      modifiers={ringModifiers ? [...(rowModifiers ?? []), ...(ringModifiers(ring, fill) ?? [])] : rowModifiers}
      style={{
        width: '100%',
        ...(ringModifiers ? {} : { borderRadius: RADIUS - RING, backgroundColor: fill }),
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
      }}>
      <TextInput
        placeholderTextColor={colors.secondaryText}
        cursorColor={colors.action}
        selectionColor={colors.action}
        textStyle={{ color: colors.text, ...textStyle }}
        style={style}
        modifiers={inputModifiers}
        ref={(instance) => {
          inputRef.current = instance;
          assignRef(ref, instance);
        }}
        onFocus={() => {
          markFieldFocused(handle);
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          // Android Compose 입력창은 첫 composition에서 포커스 없이 blur를 보낸다: 그대로 넘기면 react-hook-form
          // `onTouched`가 마운트 직후 모든 필드를 검증해 빈 폼에 오류가 뜬다. 실제로 포커스됐던 필드의 blur만 전달한다.
          if (!focused) return;
          forgetField(handle);
          setFocused(false);
          onBlur?.();
        }}
        {...props}
      />
      {trailing}
    </Row>
  );

  return ringModifiers ? (
    box
  ) : (
    <Column style={{ width: '100%', padding: RING, borderRadius: RADIUS, backgroundColor: ring }}>{box}</Column>
  );
}
