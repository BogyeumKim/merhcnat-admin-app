import { useTranslation } from '@/shared/i18n';
import { FormAlert } from '@/shared/ui/form-alert';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';

import type { ChallengeRequired } from '../model/schemas';

type MethodChoiceProps = {
  methods: ChallengeRequired['methods'];
  pending: boolean;
  errorMessage: string | null;
  onChoose: (option: ChallengeRequired['methods'][number]) => void;
  onCancel: () => void;
};

/** The user picks how the one-time code is delivered. Only the methods the server offers are shown. */
export function MethodChoice({ methods, pending, errorMessage, onChoose, onCancel }: MethodChoiceProps) {
  const { t } = useTranslation();

  return (
    <>
      <NativeText variant="title">{t('auth.verify.chooseMethodTitle')}</NativeText>
      <NativeText tone="secondary">{t('auth.verify.chooseMethodBody')}</NativeText>
      {methods.map((option) => (
        <NativeButton
          key={option.method}
          variant="outlined"
          disabled={pending}
          label={
            option.destination
              ? `${t(`auth.method.${option.method}`)} · ${option.destination}`
              : t(`auth.method.${option.method}`)
          }
          onPress={() => onChoose(option)}
        />
      ))}
      {pending ? <NativeText tone="secondary">{t('auth.verify.sending')}</NativeText> : null}
      {errorMessage ? <FormAlert message={errorMessage} /> : null}
      <NativeButton label={t('common.cancel')} variant="text" disabled={pending} onPress={onCancel} />
    </>
  );
}
