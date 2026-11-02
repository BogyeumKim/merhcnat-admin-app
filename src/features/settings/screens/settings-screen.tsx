import { Column } from '@expo/ui';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { Linking } from 'react-native';

import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage, useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeButton } from '@/shared/ui/native-button';
import { NativeText } from '@/shared/ui/native-text';
import { TabScreen } from '@/shared/ui/tab-screen';

import { usePushPermission } from '../model/use-push-permission';

/** Each language is shown in its own language, whatever the current UI language is. */
const LANGUAGE_NAMES = { ko: '한국어', en: 'English' } as const;

/** Notification permission (managed in the OS settings) and the UI language. */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const push = usePushPermission();
  const current = getCurrentLanguage();
  const pushLabel = { granted: t('settings.pushOn'), denied: t('settings.pushOff'), unknown: t('settings.pushUnknown') }[push];

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t('menu.items.settings.title') }} />
      <TabScreen>
        <Column spacing={spacing.xs} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.notifications')}
          </NativeText>
          <NativeText variant="headline">{`${t('settings.pushStatus')}: ${pushLabel}`}</NativeText>
          <NativeText variant="subhead" tone="secondary">
            {t('settings.pushHint')}
          </NativeText>
          <NativeButton variant="outlined" label={t('settings.openSystem')} onPress={() => void Linking.openSettings()} />
        </Column>
        <Column spacing={spacing.xs} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.language')}
          </NativeText>
          {SUPPORTED_LANGUAGES.map((language) => (
            <NativeButton
              key={language}
              testID={`language-${language}`}
              variant={language === current ? 'filled' : 'outlined'}
              label={LANGUAGE_NAMES[language]}
              onPress={() => void setLanguage(language)}
            />
          ))}
        </Column>
        <Column spacing={spacing.xs} style={{ width: '100%' }}>
          <NativeText variant="label" tone="secondary">
            {t('settings.about')}
          </NativeText>
          <NativeText>{`${t('settings.version')} ${Constants.expoConfig?.version ?? ''}`}</NativeText>
        </Column>
      </TabScreen>
    </>
  );
}
