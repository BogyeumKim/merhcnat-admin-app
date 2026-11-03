import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import Sms from '@expo/material-symbols/sms.xml';
import { Column, Icon, RNHostView, Row, Spacer } from '@expo/ui';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { FormAlert } from '@/shared/ui/form-alert';
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

/** The two common channels use the apps' own marks (KakaoTalk's yellow bubble, the green messages icon); the rest a plain glyph. */
const BRAND_ICONS = {
  KAKAO: require('@/assets/images/channel-kakao.svg'),
  SMS: require('@/assets/images/channel-sms.svg'),
} as const;
const GLYPHS = {
  EMAIL: { ios: 'envelope.fill', android: Sms },
  TOTP: { ios: 'lock.shield', android: Sms },
} as const;
const ICON_SIZE = 44;
const GLYPH_SIZE = 24;

function ChannelIcon({ method }: { method: ChallengeMethod }) {
  const colors = useNativeColors();

  if (method === 'KAKAO' || method === 'SMS') {
    return (
      <Column style={{ width: ICON_SIZE, height: ICON_SIZE }}>
        <RNHostView matchContents>
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ width: ICON_SIZE, height: ICON_SIZE }}>
            <Image source={BRAND_ICONS[method]} style={{ width: ICON_SIZE, height: ICON_SIZE }} />
          </View>
        </RNHostView>
      </Column>
    );
  }
  return (
    <Column style={{ padding: (ICON_SIZE - GLYPH_SIZE) / 2, borderRadius: ICON_SIZE / 2, backgroundColor: colors.card }}>
      <Icon name={GLYPHS[method]} size={GLYPH_SIZE} color={colors.text} />
    </Column>
  );
}

/** The user picks how the one-time code is delivered. Only the methods the server offers are shown. */
export function MethodChoice({ methods, pending, errorMessage, onChoose, onCancel }: MethodChoiceProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <SheetFormScreen
      footer={<NativeButton testID="verify-cancel" label={t('common.cancel')} variant="text" disabled={pending} onPress={onCancel} />}>
      <StepHeader title={t('auth.verify.chooseMethodTitle')} body={t('auth.verify.chooseMethodBody')} badge={false} />
      <Column spacing={spacing.sm} style={{ width: '100%' }}>
        {methods.map(({ method }) => (
          <Row
            key={method}
            testID={`channel-${method}`}
            alignment="center"
            spacing={spacing.md}
            onPress={() => {
              if (!pending) onChoose(method);
            }}
            style={{ width: '100%', padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.tonal }}>
            <ChannelIcon method={method} />
            <Column spacing={2}>
              <NativeText variant="headline">{t(`auth.method.${method}`)}</NativeText>
              <NativeText variant="subhead" tone="secondary">
                {t(`auth.verify.channel${method === 'KAKAO' ? 'KAKAO' : 'SMS'}Hint`)}
              </NativeText>
            </Column>
            <Spacer flexible />
            <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />
          </Row>
        ))}
      </Column>
      {pending ? <NativeText tone="secondary">{t('auth.verify.sending')}</NativeText> : null}
      {errorMessage ? <FormAlert message={errorMessage} /> : null}
    </SheetFormScreen>
  );
}
