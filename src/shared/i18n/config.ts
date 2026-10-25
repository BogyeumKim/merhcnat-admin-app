import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

import { en } from './locales/en';
import { ko } from './locales/ko';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const isLanguage = (value: string | null | undefined): value is Language =>
  SUPPORTED_LANGUAGES.some((language) => language === value);

/** Saved choice first, then the device language, then Korean. */
function resolveInitialLanguage(): Language {
  const saved = storage.getString(STORAGE_KEYS.language);
  if (isLanguage(saved)) return saved;

  const device = getLocales()[0]?.languageCode;
  return isLanguage(device) ? device : 'ko';
}

const i18n = createInstance();

// `initReactI18next` registers this instance as the one `useTranslation` reads.
void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: resolveInitialLanguage(),
  fallbackLng: 'ko',
  initAsync: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

/** Current UI language, for the `Accept-Language` header. */
export const getCurrentLanguage = (): Language => (isLanguage(i18n.language) ? i18n.language : 'ko');

export async function setLanguage(language: Language) {
  storage.setString(STORAGE_KEYS.language, language);
  await i18n.changeLanguage(language);
}
