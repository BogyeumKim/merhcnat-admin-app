import { Column, RNHostView } from '@expo/ui';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { useNativeColors } from '@/shared/theme';

const LOGO = require('@/assets/images/korpay-logo.svg');
/** `korpay-logo.svg`의 viewBox (168.6 x 56). 파일과 항상 맞춰 둘 것. */
const LOGO_ASPECT_RATIO = 168.6 / 56;

/** 주어진 높이의 로고 폭. 네이티브 트리에 로고를 넣을 때 크기를 명시하는 데 쓴다. */
const brandLogoWidth = (height: number) => height * LOGO_ASPECT_RATIO;

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
      style={{ width: brandLogoWidth(height), height }}
    />
  );
}

/**
 * `@expo/ui` 트리(스크롤 안 첫 요소 등)에 넣는 로고. 로그인 히어로와 차단 화면이 같이 쓴다.
 *  RN 이미지(SVG)를 `RNHostView`로 넣으며, 크기를 명시해야 `matchContents`가 0으로 줄지 않는다.
 */
export function BrandLogoHost({ height }: { height: number }) {
  const width = brandLogoWidth(height);

  return (
    <Column style={{ width, height }}>
      <RNHostView matchContents>
        <View style={{ width, height }}>
          <BrandLogo height={height} />
        </View>
      </RNHostView>
    </Column>
  );
}
