import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { STORAGE_KEYS, storage } from '@/shared/lib/storage';

import { en } from './locales/en';
import { ko } from './locales/ko';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const isLanguage = (value: string | null | undefined): value is Language =>
  SUPPORTED_LANGUAGES.some((language) => language === value);

/** 저장된 선택 우선, 그다음 기기 언어, 없으면 한국어. */
function resolveInitialLanguage(): Language {
  const saved = storage.getString(STORAGE_KEYS.language);
  if (isLanguage(saved)) return saved;

  const device = getLocales()[0]?.languageCode;
  return isLanguage(device) ? device : 'ko';
}

const i18n = createInstance();

// `initReactI18next`가 이 인스턴스를 `useTranslation`이 읽는 인스턴스로 등록한다.
void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: resolveInitialLanguage(),
  fallbackLng: 'ko',
  initAsync: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

/** React 밖(전역 쿼리 오류 처리 등)에서 현재 언어로 번역한다. 화면에서는 `useTranslation()`을 쓴다. */
export const translate: typeof i18n.t = i18n.t.bind(i18n);

/** 현재 UI 언어 (`Accept-Language` 헤더용). */
export const getCurrentLanguage = (): Language => (isLanguage(i18n.language) ? i18n.language : 'ko');

/** 현재 UI 언어를 구독한다: `setLanguage()` 뒤 다시 렌더된다(화면용). */
export function useCurrentLanguage(): Language {
  const { i18n: instance } = useTranslation();
  return isLanguage(instance.resolvedLanguage) ? instance.resolvedLanguage : 'ko';
}

export async function setLanguage(language: Language) {
  storage.setString(STORAGE_KEYS.language, language);
  await i18n.changeLanguage(language);
}
