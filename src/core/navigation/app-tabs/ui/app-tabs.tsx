import { NativeTabs } from 'expo-router/native-tabs';

import { useTranslation } from '@/shared/i18n';
import { useNativeColors } from '@/shared/theme';

import { TAB_ITEMS } from '../config/tabs';

/**
 * 두 플랫폼 공용 탭. iOS는 iOS 26+ SDK로 빌드하면 시스템 Liquid Glass 탭바를 쓰므로 **iOS에는 색을 넘기지 않는다**(지정하면 glass가 사라짐).
 *  Android는 Material 3 내비게이션 바를 쓰는데, 기본값은 생성된 팔레트의 라벤더 틴트가 되므로 홈 카드와 같은 흰 표면,
 *  선택 탭은 ink 색, 나머지는 회색, pill 없음으로 지정한다 (Korpay 디자인: 선택은 어둡게, 나머지는 회색).
 */
export default function AppTabs() {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const androidColors =
    process.env.EXPO_OS === 'android'
      ? {
          backgroundColor: colors.card,
          indicatorColor: 'transparent',
          labelVisibilityMode: 'labeled' as const,
          iconColor: { default: colors.secondaryText, selected: colors.ink },
          labelStyle: { default: { color: colors.secondaryText }, selected: { color: colors.ink } },
        }
      : {};

  return (
    <NativeTabs minimizeBehavior="onScrollDown" {...androidColors}>
      {TAB_ITEMS.map(({ name, labelKey, sf, md }) => (
        <NativeTabs.Trigger key={name} name={name}>
          <NativeTabs.Trigger.Label>{t(labelKey)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={sf} md={md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
