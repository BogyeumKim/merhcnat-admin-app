import { getCurrentLanguage, type Language } from '@/shared/i18n';

const LOCALES: Record<Language, string> = { ko: 'ko-KR', en: 'en-US' };

/** `Intl` 포맷터 생성은 비싸므로 언어별로 한 번만 만든다(행마다 금액을 포맷한다). 언어를 바꾸면 새 언어의 포맷터를 쓴다. */
function perLanguage<T>(create: (locale: string) => T): () => T {
  const cache = new Map<Language, T>();
  return () => {
    const language = getCurrentLanguage();
    let formatter = cache.get(language);
    if (formatter === undefined) {
      formatter = create(LOCALES[language]);
      cache.set(language, formatter);
    }
    return formatter;
  };
}

const amountFormat = perLanguage((locale) => new Intl.NumberFormat(locale));
const weekdayFormat = perLanguage((locale) => new Intl.DateTimeFormat(locale, { weekday: 'short' }));
const clockFormat = perLanguage((locale) => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }));

/** 천 단위 구분 기호를 넣은 전체 금액: 1,250,000. */
export const formatAmount = (value: number) => amountFormat().format(value);

/** ISO 날짜의 짧은 요일 이름(ko: 수, en: Wed). 기기 시간대의 그날 자정으로 해석한다. */
export const formatWeekday = (isoDate: string) => weekdayFormat().format(new Date(`${isoDate}T00:00:00`));

/** 타임스탬프의 시각(14:32). 한국 앱이 "기준 시각" 라벨에 쓰는 24시간제. */
export const formatClock = (timestamp: number) => clockFormat().format(new Date(timestamp));
