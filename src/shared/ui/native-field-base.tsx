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
/** SwiftUI가 입력란을 갈아 끼운 뒤(이전 입력란의 blur 이후) 포커스를 준다. */
const REFOCUS_DELAY_MS = 50;

/** 바깥에서 받은 ref(콜백 또는 객체)에 입력란 인스턴스를 넘긴다. */
function assignRef(ref: Ref<TextInputRef> | undefined, instance: TextInputRef | null) {
  if (typeof ref === 'function') ref(instance);
  else if (ref) ref.current = instance;
}

/**
 * 박스형 필드, Korpay 디자인: 기본은 옅은 색의 둥근 박스, 포커스 시 흰색 + 1.5 ink 링. 오류여도 박스 색은 그대로다
 *  (스펙: 입력란을 빨갛게 칠하지 않고 아래에 빨간 문장 + 아이콘). Android는 박스를 감싼 링 색의 둥근 `Column`, iOS는 `ringModifiers`의
 *  `strokeBorder`로 링을 그린다 (`borderWidth` + `borderRadius` 조합은 iOS에서 테두리가 잘린다). `fontSize` 없음: 글자는 시스템 글자 크기를 따른다.
 *  여기서 유지하는 상태는 포커스 boolean뿐이며 텍스트는 절대 보관하지 않는다.
 */
export function NativeFieldBase({
  style,
  textStyle,
  // 박스 모양에 쓰지 않는다(아래 주석). TextInput으로 넘기지 않으려고 꺼내기만 한다.
  invalid: _invalid,
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
  // 오류여도 입력란을 빨갛게 칠하지 않는다(디자인 스펙): 오류는 아래 빨간 문장(`LabeledField error`)이 알리고, 링은 포커스만 나타낸다.
  const ring = focused ? colors.text : colors.field;
  const fill = focused ? colors.card : colors.field;

  // iOS 비밀번호 보기/숨기기: `secureTextEntry`가 바뀌면 SwiftUI가 SecureField ↔ TextField를 갈아 끼워 포커스(키보드)가 풀린다.
  // 바뀌기 직전 렌더에서 포커스 중이었다면 새 입력란에 다시 포커스를 준다(커서는 끝으로 간다). Android Compose는 같은 입력란이라 해당 없음.
  const secure = Boolean(props.secureTextEntry);
  const [lastSecure, setLastSecure] = useState(secure);
  const [refocusToken, setRefocusToken] = useState(0);
  if (lastSecure !== secure) {
    setLastSecure(secure);
    if (focused && process.env.EXPO_OS === 'ios') setRefocusToken((token) => token + 1);
  }
  useEffect(() => {
    if (refocusToken === 0) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), REFOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [refocusToken]);

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
