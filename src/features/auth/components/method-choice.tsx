import { Column, Icon, RNHostView, Row, Spacer } from '@expo/ui';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { openSheet } from '@/shared/lib/open-sheet';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { FILL_ROW } from '@/shared/ui/fill-row';
import { FormAlert } from '@/shared/ui/form-alert';
import { IconButton } from '@/shared/ui/icon-button';
import { icons } from '@/shared/ui/icons';
import { LinkText } from '@/shared/ui/link-text';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { pressableA11y } from '@/shared/ui/pressable-a11y';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { StepHeader } from './step-header';
import { TOP_BAR_GLYPH } from './top-bar';
import type { ChallengeMethod, ChallengeOption } from '../model/schemas';

type MethodChoiceProps = {
  methods: ChallengeOption[];
  /** 마지막으로 인증에 성공한 수단: "최근 사용" 배지와 진한 테두리. */
  recentMethod?: ChallengeMethod;
  pending: boolean;
  errorMessage: string | null;
  /** 카드(또는 이메일 받기)를 누름: 같은 수단이어도 항상 새 코드를 보낸다. */
  onChoose: (method: ChallengeMethod) => void;
  /** 진행 막대 줄 끝 X: 인증을 그만두고 시트를 닫는다. */
  onCancel: () => void;
};

/** 카카오톡 자체 마크(노란 말풍선, Kakao 브랜드 자산). 다른 채널은 회색 타일 위에 단순 글리프를 쓴다. */
const KAKAO_MARK = require('@/assets/images/channel-kakao.svg');
const GLYPHS = {
  SMS: icons.sms,
  EMAIL: icons.mail,
  TOTP: icons.totp,
} as const;
const TILE = 44;
const GLYPH = 22;
const CARD_RING = 1.5;

function ChannelTile({ method }: { method: ChallengeMethod }) {
  const colors = useNativeColors();

  if (method === 'KAKAO') {
    return (
      <Column style={{ width: TILE, height: TILE }}>
        <RNHostView matchContents>
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ width: TILE, height: TILE }}>
            <Image source={KAKAO_MARK} style={{ width: TILE, height: TILE }} />
          </View>
        </RNHostView>
      </Column>
    );
  }
  return (
    <Column
      alignment="center"
      style={{ width: TILE, height: TILE, borderRadius: radius.md, backgroundColor: colors.tonal }}>
      <Spacer flexible />
      <Icon name={GLYPHS[method]} size={GLYPH} color={colors.text} />
      <Spacer flexible />
    </Column>
  );
}

/** "010-****-0000 알림톡으로 받기"처럼 서버가 마스킹한 수신처를 붙인 안내. 수신처가 없으면(이전 서버) 수단 안내만. */
function useChannelHint() {
  const { t } = useTranslation();
  return ({ method, destination }: ChallengeOption) => {
    if (method === 'KAKAO') return destination ? t('auth.verify.channelKAKAOTo', { destination }) : t('auth.verify.channelKAKAOHint');
    if (method === 'EMAIL') return destination ? t('auth.verify.channelEMAILTo', { destination }) : t('auth.verify.channelEMAILHint');
    return destination ? t('auth.verify.channelSMSTo', { destination }) : t('auth.verify.channelSMSHint');
  };
}

function RecentBadge() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  return (
    <Column style={{ paddingHorizontal: spacing.sm - 2, paddingVertical: 2, borderRadius: radius.sm, backgroundColor: colors.actionSurface }}>
      <NativeText variant="caption" tone="action">
        {t('auth.verify.recent')}
      </NativeText>
    </Column>
  );
}

/** 진행 막대 줄 끝의 닫기 X(44pt `IconButton`). 그래버 스와이프의 한 번 탭 대안이다(WCAG 2.5.1). */
function CloseButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  return <IconButton icon={icons.close} size={TOP_BAR_GLYPH} weight="medium" color={colors.text} testID="verify-cancel" label={t('auth.verify.close')} onPress={onPress} />;
}

/**
 * 일회용 코드를 받을 방식을 고른다. 서버가 제공하는 방식만 표시한다(서버가 비어 있는 연락처 컬럼은 빼고 내려준다).
 * 닫기는 그래버(아래로 끌기)와 진행 막대 줄 끝 X 둘 다 둔다(`.claude/rules/expo-ui.md` form sheet 그래버).
 */
export function MethodChoice({ methods, recentMethod, pending, errorMessage, onChoose, onCancel }: MethodChoiceProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const hintOf = useChannelHint();
  const close = <CloseButton onPress={onCancel} />;
  const onlyEmail = methods.length === 1 && methods[0]?.method === 'EMAIL' ? methods[0] : null;

  // 휴대폰 번호가 없고 이메일만 있는 계정(디자인): 고를 것이 없으니 받을 이메일을 보여주고 바로 보낸다.
  if (onlyEmail) {
    return (
      <SheetFormScreen grabber
        footer={<NativeButton testID="verify-send-email" label={t('auth.verify.sendCode')} disabled={pending} onPress={() => onChoose('EMAIL')} />}>
        <StepHeader title={t('auth.verify.emailOnlyTitle')} body={t('auth.verify.chooseMethodBody')} step={{ current: 1, total: 2 }} trailing={close} />
        <Row
          alignment="center"
          spacing={spacing.md}
          style={{ width: '100%', padding: spacing.md, borderRadius: radius.xl - 4, backgroundColor: colors.infoSurface }}>
          <ChannelTile method="EMAIL" />
          <Column spacing={2} modifiers={FILL_ROW}>
            <NativeText variant="caption" tone="secondary">
              {t('auth.verify.emailTo')}
            </NativeText>
            <NativeText variant="headline">{onlyEmail.destination ?? t('auth.method.EMAIL')}</NativeText>
          </Column>
        </Row>
        {pending ? <NativeText tone="secondary">{t('auth.verify.sending')}</NativeText> : null}
        {errorMessage ? <FormAlert boxed message={errorMessage} /> : null}
      </SheetFormScreen>
    );
  }

  return (
    <SheetFormScreen grabber>
      <StepHeader title={t('auth.verify.chooseMethodTitle')} body={t('auth.verify.chooseMethodBody')} step={{ current: 1, total: 2 }} trailing={close} />
      {/* 실패는 카드 바로 위에: 맨 아래에 두면 화면 밖이라 눌러도 아무 일이 없는 것처럼 보였다. */}
      {errorMessage ? <FormAlert boxed message={errorMessage} /> : null}
      <Column spacing={spacing.sm} style={{ width: '100%', paddingTop: spacing.sm }}>
        {methods.map((option) => {
          const recent = option.method === recentMethod;
          const name = t(`auth.method.${option.method}`);
          // 카드 하나를 버튼 하나로 읽는다: "카카오톡, 최근 사용, 010-****-0000 알림톡으로 받기".
          const a11yLabel = [name, recent ? t('auth.verify.recent') : null, hintOf(option)].filter((part) => part !== null).join(', ');
          return (
            <Column
              key={option.method}
              testID={`channel-${option.method}`}
              onPress={() => {
                if (!pending) onChoose(option.method);
              }}
              modifiers={pressableA11y(a11yLabel)}
              style={{ width: '100%', padding: CARD_RING, borderRadius: radius.xl - 4, backgroundColor: recent ? colors.ink : colors.hairline }}>
              <Row
                alignment="center"
                spacing={spacing.md}
                style={{ width: '100%', padding: spacing.md - CARD_RING, borderRadius: radius.xl - 4 - CARD_RING, backgroundColor: colors.card }}>
                <ChannelTile method={option.method} />
                {/* 글 열이 남는 폭만 받아 줄바꿈된다: 긴 안내(영문 카카오톡 등)가 셰브런을 밀어내지 않게. */}
                <Column spacing={2} modifiers={FILL_ROW}>
                  <Row alignment="center" spacing={spacing.sm}>
                    <NativeText variant="headline">{name}</NativeText>
                    {recent ? <RecentBadge /> : null}
                  </Row>
                  <NativeText variant="subhead" tone="secondary">
                    {hintOf(option)}
                  </NativeText>
                </Column>
                <Icon name={icons.chevronRight} size={18} color={colors.secondaryText} />
              </Row>
            </Column>
          );
        })}
      </Column>
      <Column alignment="center" style={{ width: '100%' }}>
        <LinkText testID="verify-phone-changed" onPress={() => void openSheet({ pathname: '/login-help', params: { open: 'phone' } })}>
          {t('auth.verify.phoneChanged')}
        </LinkText>
      </Column>
      {pending ? <NativeText tone="secondary">{t('auth.verify.sending')}</NativeText> : null}
    </SheetFormScreen>
  );
}
