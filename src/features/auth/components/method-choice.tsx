import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import Sms from '@expo/material-symbols/sms.xml';
import { Column, Icon, RNHostView, Row, Spacer } from '@expo/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { FormAlert } from '@/shared/ui/form-alert';
import { LinkText } from '@/shared/ui/link-text';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { SheetFormScreen } from '@/shared/ui/sheet-form-screen';

import { StepHeader } from './step-header';
import type { ChallengeMethod, ChallengeRequired } from '../model/schemas';

type MethodChoiceProps = {
  methods: ChallengeRequired['methods'];
  pending: boolean;
  errorMessage: string | null;
  onChoose: (method: ChallengeMethod) => void;
  onCancel: () => void;
};

/** KakaoTalk's own mark (the yellow bubble, from Kakao's brand assets); the other channels get a plain glyph on a gray tile. */
const KAKAO_MARK = require('@/assets/images/channel-kakao.svg');
const GLYPHS = {
  SMS: { ios: 'text.bubble', android: Sms },
  EMAIL: { ios: 'envelope', android: Sms },
  TOTP: { ios: 'lock.shield', android: Sms },
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

/** The user picks how the one-time code is delivered. Only the methods the server offers are shown. */
export function MethodChoice({ methods, pending, errorMessage, onChoose, onCancel }: MethodChoiceProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <SheetFormScreen footer={<NativeButton testID="verify-cancel" variant="tonal" label={t('auth.verify.close')} disabled={pending} onPress={onCancel} />}>
      <StepHeader title={t('auth.verify.chooseMethodTitle')} body={t('auth.verify.chooseMethodBody')} step={{ current: 1, total: 2 }} />
      <Column spacing={spacing.sm} style={{ width: '100%', paddingTop: spacing.sm }}>
        {methods.map(({ method }) => (
          <Column
            key={method}
            testID={`channel-${method}`}
            onPress={() => {
              if (!pending) onChoose(method);
            }}
            style={{ width: '100%', padding: CARD_RING, borderRadius: radius.xl - 4, backgroundColor: colors.hairline }}>
            <Row
              alignment="center"
              spacing={spacing.md}
              style={{ width: '100%', padding: spacing.md - CARD_RING, borderRadius: radius.xl - 4 - CARD_RING, backgroundColor: colors.card }}>
              <ChannelTile method={method} />
              <Column spacing={2}>
                <NativeText variant="headline">{t(`auth.method.${method}`)}</NativeText>
                <NativeText variant="subhead" tone="secondary">
                  {t(`auth.verify.channel${method === 'KAKAO' ? 'KAKAO' : 'SMS'}Hint`)}
                </NativeText>
              </Column>
              <Spacer flexible />
              <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={18} color={colors.secondaryText} />
            </Row>
          </Column>
        ))}
      </Column>
      <Column alignment="center" style={{ width: '100%' }}>
        <LinkText testID="verify-phone-changed" onPress={() => router.push({ pathname: '/login-help', params: { open: 'phone' } })}>
          {t('auth.verify.phoneChanged')}
        </LinkText>
      </Column>
      {pending ? <NativeText tone="secondary">{t('auth.verify.sending')}</NativeText> : null}
      {errorMessage ? <FormAlert boxed message={errorMessage} /> : null}
    </SheetFormScreen>
  );
}
