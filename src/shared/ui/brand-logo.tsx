import { Image } from 'expo-image';

import { useNativeColors } from '@/shared/theme';

const LOGO = require('@/assets/images/korpay-logo.svg');
/** `korpay-logo.svg`의 viewBox (168.6 x 56). 파일과 항상 맞춰 둘 것. */
const LOGO_ASPECT_RATIO = 168.6 / 56;

/**
 * Korpay 워드마크 (대부분의 로그인 화면처럼 텍스트만). SVG는 `expo-image`가 네이티브로 디코딩한다 (캐시되며 벡터 유지).
 *  K는 브랜드 레드로 채우고 나머지 글자는 `svgVariables`(SDK 58)로 테마를 따르므로 다크 모드용 에셋이 따로 필요 없다.
 *  다른 로고를 쓰려면 `korpay-logo.svg`(또는 PNG)를 교체하고 `LOGO_ASPECT_RATIO`를 갱신한다.
 */
export function BrandLogo({ height = 44 }: { height?: number }) {
  const { ink } = useNativeColors();

  return (
    <Image
      source={LOGO}
      svgVariables={{ '--korpay-ink': ink }}
      contentFit="contain"
      alt="Korpay"
      accessible
      // 폭을 명시한다: 높이+비율만 주고 `maxWidth: '100%'`를 쓰면 내용 크기를 따르는 부모(RNHostView matchContents 등)에서 폭이 0으로 계산돼 로고가 사라졌다.
      style={{ width: height * LOGO_ASPECT_RATIO, height }}
    />
  );
}
