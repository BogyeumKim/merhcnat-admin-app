import { useColorScheme } from 'react-native';

/**
 * 앱의 유일한 색 토큰: `@expo/ui` prop(일반 문자열 필요)과 RN 뷰 모두 이 hex 팔레트를 쓴다.
 * (플랫폼 시맨틱 색 `Color.ios.*`/`Color.android.dynamic.*`는 쓰지 않는다: `@expo/ui`에 넘길 수 없고 Android 12+ 동적 색이 브랜드 디자인과 어긋난다.)
 * 브랜드 레드는 레거시 앱(`mainColor: #ff003a`)에서 가져왔다.
 * 이 레드는 흰색 대비 3.95:1에 그치므로 로고 등 그래픽에 쓰고, 텍스트/버튼에는 같은 색상의 더 어둡거나 밝은
 * 단계인 `action`을 쓴다. WCAG 2.x 대비(계산값):
 * - light: action #E10033 = 흰색 위 및 흰색 라벨 4.94; text #191E28 = 16.7; secondary #5A6472 = 6.0(field 위 5.4);
 *   danger #B42318 = 6.57(자체 surface 위 6.05); border #8A94A6 = 3.06.
 * - dark: action #E51E43 = 검정 위 4.60, 흰색 라벨 4.57(채움 버튼과 텍스트 버튼에 한 값을 함께 쓰므로
 *   둘 다 통과하는 좁은 구간에 있음); text 19.4; secondary 10.05; danger #FF8A80 = 9.2;
 *   border #6B7690 = 검정 위 4.62.
 * 한계: `field` 채움 위의 `action` 텍스트는 4.47(4.5 바로 아래)이므로 action 색 텍스트는 field 위에 두지 않는다.
 * field 테두리는 field 채움 대비 2.77이며, 3:1 기준은 페이지 대비 바깥 가장자리(3.06 / 4.62)에서 충족한다.
 * 브랜드 레드와 오류 레드는 색상이 가깝다(danger 대 action: 라이트 1.33:1, 다크 2.0:1): 오류는 색상 텍스트만으로
 * 표시하지 않는다(테두리와 색조가 있는 `FormAlert`, 입력란 테두리, 메시지 텍스트).
 */
const palettes = {
  light: Object.freeze({
    scheme: 'light',
    brand: '#ff003a',
    action: '#E10033',
    /** `action` 채움 위의 라벨(라이트 대비 4.94, 위 설명 참고). */
    onAction: '#FFFFFF',
    /** 폼과 시트 뒤의 페이지: 라이트는 흰색(디자인), 다크는 어두운 캔버스. Android 12+에서 라벤더 색조가 도는 시스템 동적 surface는 쓰지 않는다. */
    background: '#FFFFFF',
    ink: '#2D3640',
    text: '#191E28',
    secondaryText: '#5A6472',
    danger: '#B42318',
    dangerSurface: '#FEF3F2',
    field: '#F1F4F6',
    /** 흰 카드 뒤의 페이지 배경(홈), 카드 surface, 카드 위 버튼 채움. */
    canvas: '#F2F4F8',
    card: '#FFFFFF',
    tonal: '#EEF1F6',
    fieldBorder: '#8A94A6',
    /** 선택되지 않은 카드의 헤어라인(Korpay 디자인의 #E3E7EE), 차분한 안내 패널 채움, 성공 색 쌍. */
    hairline: '#E3E7EE',
    infoSurface: '#F6F7FA',
    success: '#0B6B3A',
    successSurface: '#E8F5EE',
    /** 상태 화면 배지: 주의(안전하지 않은 기기)는 앰버, 조치(업데이트, 잠금)는 분홍 색조 위. 글리프 색상 전용이며 텍스트에는 쓰지 않는다. */
    warning: '#9A4A00',
    warningSurface: '#FFF1E0',
    actionSurface: '#FFEBEF',
    /** `actionSurface` 위 작은 강조 글자("최근 사용" 배지). `action` 그대로는 4.33이라 한 단계 어둡게: 5.51. */
    actionText: '#C2002C',
    /** Android 시트 드래그 핸들(M3 onSurfaceVariant 40% 상당): `secondaryText`에 알파 0x66. 장식용이라 대비 기준 밖. */
    sheetHandle: '#5A647266',
  }),
  dark: Object.freeze({
    scheme: 'dark',
    brand: '#ff003a',
    action: '#E51E43',
    /** `action` 채움 위의 라벨(다크 대비 4.57, 위 설명 참고). */
    onAction: '#FFFFFF',
    background: '#0B0F19',
    ink: '#F2F6FF',
    text: '#F2F6FF',
    secondaryText: '#A9B4C8',
    danger: '#FF8A80',
    dangerSurface: '#2A1512',
    field: '#1D2433',
    canvas: '#0B0F19',
    card: '#1D2433',
    tonal: '#2A3347',
    fieldBorder: '#6B7690',
    hairline: '#2A3347',
    infoSurface: '#151B29',
    success: '#7DD3A0',
    successSurface: '#12261B',
    warning: '#FFB866',
    warningSurface: '#2D2113',
    actionSurface: '#331821',
    /** 다크 `actionSurface`(#331821) 위 강조 글자: 7.0. */
    actionText: '#FF8FA3',
    sheetHandle: '#A9B4C866',
  }),
} as const;

/**
 * `@expo/ui` 스타일 prop(일반 문자열 필요)과 브랜드 토큰용 hex 색상.
 * 훅 전용: 렌더 시점에 색상 스킴을 읽는다. 반환 객체는 공유 상수다.
 */
export function useNativeColors() {
  return palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
