/**
 * 인증 시트 상단 바(뒤로) 아이콘 버튼의 글리프 크기. 터치 영역은 `IconButton`의 44pt.
 * iOS는 SF Symbol 20pt(medium), Android는 Material 기본 24dp.
 */
export const TOP_BAR_GLYPH = process.env.EXPO_OS === 'ios' ? 20 : 24;
