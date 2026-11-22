import { Column, Icon, Row } from '@expo/ui';

import { SUPPORT } from '@/shared/config/support';
import { useTranslation } from '@/shared/i18n';
import { openSupportChat, openSupportPhone } from '@/shared/lib/support-contact';
import { spacing, useNativeColors, useWindowLayout } from '@/shared/theme';

import { FILL_ROW } from './fill-row';
import { icons } from './icons';
import { NativeButton } from './native-button';
import { NativeText } from './native-text';

/** Kakao 브랜드 고정 색(`assets/images/channel-kakao.svg`와 같은 값): 노란 원 + 진갈색 말풍선. 테마와 무관하다. */
const KAKAO_YELLOW = '#FAE100';
const KAKAO_BROWN = '#3C1E1E';
/** 원 22pt = 글리프 12 + 위아래 5. 고정 크기 Column 안의 Icon은 Android에서 가운데 오지 않아 패딩으로 만든다. */
const MARK_GLYPH = 12;
const MARK_PADDING = 5;
const MARK_STYLE = { padding: MARK_PADDING, borderRadius: (MARK_GLYPH + MARK_PADDING * 2) / 2, backgroundColor: KAKAO_YELLOW } as const;
const PHONE_GLYPH = 20;
const FULL_WIDTH = { width: '100%' } as const;
const NO_MODIFIERS: typeof FILL_ROW = [];

/**
 * 카카오 마크를 네이티브로 그린다(노란 원 + 말풍선 글리프). SVG(`expo-image`)는 `RNHostView`가 필요한데,
 * SwiftUI `Button` 라벨 안의 RN 뷰는 그 자리의 탭을 가로챌 수 있어 버튼 안에는 네이티브 도형만 둔다.
 */
function KakaoMark() {
  return (
    <Column style={MARK_STYLE}>
      <Icon name={icons.kakaoTalk} size={MARK_GLYPH} color={KAKAO_BROWN} />
    </Column>
  );
}

type SupportContactButtonsProps = {
  /** 위에 "고객센터 연락하기" + "평일 09:00~18:00"를 둔다(로그인 도움말 시트 하단, PDF p3). */
  header?: boolean;
};

/**
 * 고객센터 연락 버튼 한 쌍: [카카오톡 상담] [전화 상담]을 반반 나란히(PDF p3, p8, p33~42). 고르는 창을 따로 띄우지 않는다.
 *  두 칸은 `FILL_ROW`로 부모 폭을 똑같이 나눠 시트·차단 화면·분할 창 어디서든 맞는다(창 폭으로 계산하지 않는다).
 *  손쉬운 사용 글꼴(`isLargeText`)에서는 위아래로 쌓는다: 반 폭에서는 라벨이 한 글자씩 줄바꿈되어 버튼이 매우 높아지고, 시트 하단에서 잘렸다.
 *  `@expo/ui` 요소이므로 `NativeHost`/폼 셸 안에서 쓴다. 연타와 실패 토스트는 `openSupportChat`/`openSupportPhone`이 처리한다.
 */
export function SupportContactButtons({ header = false }: SupportContactButtonsProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { isLargeText } = useWindowLayout();
  const Pair = isLargeText ? Column : Row;
  // 나란히: 두 칸이 폭을 반씩(`FILL_ROW`). 세로로 쌓기: 각 칸이 전체 폭.
  const cell = isLargeText ? { style: FULL_WIDTH, modifiers: NO_MODIFIERS } : { modifiers: FILL_ROW };

  return (
    <Column
      spacing={spacing.sm}
      style={FULL_WIDTH}>
      {header ? (
        <Column
          spacing={spacing.xxs}
          style={FULL_WIDTH}>
          <NativeText variant="headline">{t('support.title')}</NativeText>
          <NativeText
            variant="subhead"
            tone="secondary">
            {t('support.weekdayHours', SUPPORT.hours)}
          </NativeText>
        </Column>
      ) : null}
      <Pair
        spacing={spacing.sm}
        style={FULL_WIDTH}>
        <Column {...cell}>
          <NativeButton
            variant="tonal"
            label={t('support.kakao')}
            accessibilityLabel={t('support.kakaoA11y')}
            leading={<KakaoMark />}
            onPress={() => void openSupportChat()}
            testID="support-kakao"
          />
        </Column>
        <Column {...cell}>
          <NativeButton
            variant="tonal"
            label={t('support.phone')}
            accessibilityLabel={t('support.phoneA11y', { phone: SUPPORT.display })}
            leading={
              <Icon
                name={icons.phone}
                size={PHONE_GLYPH}
                color={colors.text}
              />
            }
            onPress={() => void openSupportPhone()}
            testID="support-phone"
          />
        </Column>
      </Pair>
    </Column>
  );
}
