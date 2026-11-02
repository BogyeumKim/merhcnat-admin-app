import ChatBubble from '@expo/material-symbols/chat_bubble.xml';
import ChevronRight from '@expo/material-symbols/chevron_right.xml';
import Sms from '@expo/material-symbols/sms.xml';
import { Column, Icon, ListItem } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { spacing, useNativeColors } from '@/shared/theme';
import { FieldUnderline } from '@/shared/ui/field-underline';
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

const ICONS = {
  KAKAO: { ios: 'bubble.left.fill', android: ChatBubble },
  SMS: { ios: 'message.fill', android: Sms },
  EMAIL: { ios: 'envelope.fill', android: Sms },
  TOTP: { ios: 'lock.shield', android: Sms },
} as const;

/** The user picks how the one-time code is delivered. Only the methods the server offers are shown. */
export function MethodChoice({ methods, pending, errorMessage, onChoose, onCancel }: MethodChoiceProps) {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <SheetFormScreen
      footer={<NativeButton testID="verify-cancel" label={t('common.cancel')} variant="text" disabled={pending} onPress={onCancel} />}>
      <StepHeader title={t('auth.verify.chooseMethodTitle')} body={t('auth.verify.chooseMethodBody')} />
      <Column style={{ width: '100%' }}>
        {methods.map(({ method }) => (
          <Column key={method} style={{ width: '100%' }}>
            <Column style={{ width: '100%', paddingVertical: spacing.xs }}>
              <ListItem
                testID={`channel-${method}`}
                leading={<Icon name={ICONS[method]} size={22} color={colors.text} />}
                trailing={
                  <Icon name={{ ios: 'chevron.right', android: ChevronRight }} size={16} color={colors.secondaryText} />
                }
                supportingText={
                  <NativeText variant="subhead" tone="secondary">
                    {t(`auth.verify.channel${method === 'KAKAO' ? 'KAKAO' : 'SMS'}Hint`)}
                  </NativeText>
                }
                onPress={pending ? undefined : () => onChoose(method)}>
                <NativeText variant="headline">{t(`auth.method.${method}`)}</NativeText>
              </ListItem>
            </Column>
            <FieldUnderline invalid={false} focused={false} />
          </Column>
        ))}
      </Column>
      {pending ? <NativeText tone="secondary">{t('auth.verify.sending')}</NativeText> : null}
      {errorMessage ? <FormAlert message={errorMessage} /> : null}
    </SheetFormScreen>
  );
}
