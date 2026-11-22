import { z } from 'zod';

const isoDate = z.iso.datetime({ offset: true });

/** 언어별로 한 번만 만든다(`Intl.DateTimeFormat` 생성은 비싸다). */
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(language: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(language);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit' });
    dateFormatters.set(language, formatter);
  }
  return formatter;
}

/**
 * "11월 3일(화) 오후 7:53"(en: "Tue, November 3 at 7:53 PM")처럼 앱 언어로. 값이 없거나 잘못됐으면 `null`(그 행을 숨긴다).
 * 한국어 `Intl`은 요일 괄호 앞에 공백을 넣으므로("3일 (화)") 디자인에 맞게 붙인다.
 */
export function formatMaintenanceDate(value: string | undefined, language: string): string | null {
  const parsed = isoDate.safeParse(value);
  if (!parsed.success) return null;
  const text = dateFormatter(language).format(new Date(parsed.data));
  return language.startsWith('ko') ? text.replace(' (', '(') : text;
}
