import { Column, Row, Spacer } from '@expo/ui';

import { radius, useNativeColors } from '@/shared/theme';
import { FILL_ROW } from '@/shared/ui/fill-row';
import { NativeText } from '@/shared/ui/native-text';

import { OTP_BOX_GAP, OTP_BOX_HEIGHT } from '../hooks/use-otp-code-field';
import { CODE_LENGTH } from '../model/forms';

const RING = 1.5;
const CARET = '|';
const SOFT_ALPHA = '55';

type OtpBoxesProps = {
  value: string;
  focused: boolean;
  invalid: boolean;
  /** 확인 중이거나 입력 시간이 지남: 모든 칸이 회색으로 잠기고 커서를 그리지 않는다. */
  inactive: boolean;
};

/**
 * 인증번호 6칸(디자인): 휴지 칸은 `canvas` 채움, 입력할 칸은 흰 바탕 + 잉크 링 + 커서.
 * 오류(디자인 p11)면 입력할 칸(비운 뒤라 첫 칸)은 진한 danger 링, 나머지는 옅은 danger 링이다(색만이 아니라 아래 문장으로도 알린다).
 * 잠김(확인 중, 시간 초과)은 링 없는 회색 칸 + 흐린 숫자.
 * 링은 이중 둥근 사각형(링 색 바깥 칸 + 채움 안쪽 칸)으로 그린다: iOS에서 universal border + radius는 모서리가 잘린다.
 * 칸 폭은 계산하지 않는다: 칸마다 `FILL_ROW`(iOS 유연 프레임, Android `weight(1)`) 래퍼를 둬 6칸이 행 폭을 똑같이 나눈다.
 * 행은 부모(콘텐츠 컬럼, `CONTENT_MAX_WIDTH` 이하) 폭을 채우므로 넓은 폼 시트·좁은 창 모두 칸이 콘텐츠 폭에 맞는다.
 * 실제 입력은 위에 겹친 투명 입력란이 받으며, 이 칸들은 보조기술에서 숨긴다(입력란이 낭독 대상).
 */
export function OtpBoxes({ value, focused, invalid, inactive }: OtpBoxesProps) {
  const colors = useNativeColors();
  const nextIndex = Math.min(value.length, CODE_LENGTH - 1);
  const activeIndex = !inactive && focused && value.length < CODE_LENGTH ? value.length : -1;
  // 옅은 오류 링: danger에 알파(0x55)를 붙인다(팔레트의 `sheetHandle`과 같은 8자리 hex 방식).
  const softDanger = `${colors.danger}${SOFT_ALPHA}`;

  return (
    <Row spacing={OTP_BOX_GAP}>
      {Array.from({ length: CODE_LENGTH }, (_, index) => {
        const digit = value[index];
        const active = index === activeIndex;
        const ring = inactive
          ? colors.canvas
          : invalid
            ? index === nextIndex
              ? colors.danger
              : softDanger
            : active
              ? colors.ink
              : colors.canvas;
        const fill = !inactive && (invalid || active) ? colors.card : colors.canvas;
        return (
          // 래퍼가 남는 폭의 1/6을 받고, 칸(링+채움)은 래퍼 폭을 100% 채운다(iOS는 배경이 유연 프레임보다 먼저 붙어 칸 자체에 줄 수 없다).
          <Column key={index} modifiers={FILL_ROW}>
            <Column style={{ width: '100%', height: OTP_BOX_HEIGHT, padding: RING, borderRadius: radius.lg, backgroundColor: ring }}>
              <Column
                alignment="center"
                style={{
                  width: '100%',
                  height: OTP_BOX_HEIGHT - 2 * RING,
                  borderRadius: radius.lg - RING,
                  backgroundColor: fill,
                }}>
                <Spacer flexible />
                {digit ? (
                  <NativeText variant="title" tone={inactive ? 'secondary' : 'default'}>
                    {digit}
                  </NativeText>
                ) : active ? (
                  <NativeText variant="title">{CARET}</NativeText>
                ) : null}
                <Spacer flexible />
              </Column>
            </Column>
          </Column>
        );
      })}
    </Row>
  );
}
