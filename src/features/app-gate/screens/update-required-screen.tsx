import { Column, Row, Spacer } from '@expo/ui';

import { useTranslation } from '@/shared/i18n';
import { useBlockBackButton } from '@/shared/lib/use-block-back-button';
import { radius, spacing, useNativeColors, useWindowLayout } from '@/shared/theme';
import { BlockingScreenLayout } from '@/shared/ui/blocking-screen-layout';
import { DecorativeIcon } from '@/shared/ui/decorative-icon';
import { icons } from '@/shared/ui/icons';
import { NativeText } from '@/shared/ui/native-text';

import { useUpdateRequired } from '../hooks/use-update-required';

/**
 * 업데이트 전까지 앱을 막는다(`UPDATE_REQUIRED`, 디자인 1-12). "지금 1.0.0 → 최신 1.1.0" 카드와 [업데이트하기](스토어)뿐이며
 * 건너뛰기가 없다. 스토어에서 돌아오면 버전을 다시 확인한다. Android 뒤로가기는 앱 종료. 동작은 `useUpdateRequired`.
 */
export default function UpdateRequiredScreen() {
  const { t } = useTranslation();
  const { current, required, update } = useUpdateRequired();

  useBlockBackButton(true, 'exit');

  return (
    <BlockingScreenLayout
      icon={icons.download}
      tone="action"
      title={t('updateRequired.title')}
      description={t('updateRequired.body')}
      details={<VersionCompare current={current} required={required} />}
      primaryAction={{ testID: 'update-store', label: t('updateRequired.action'), onPress: update }}
    />
  );
}

const CARD_PADDING = spacing.md + spacing.xs;

/**
 * "지금 1.0.0 → 최신 1.1.0" 카드. 큰 글꼴(`isLargeText`)에서는 한 줄에 들어가지 않아(Compose `Row`는 앞 문구가 폭을 먼저 가져가
 * 뒤 문구가 0 폭이 된다) 위아래로 쌓고 화살표를 아래 방향으로 바꾼다.
 */
function VersionCompare({ current, required }: { current: string; required: string | undefined }) {
  const { t } = useTranslation();
  const colors = useNativeColors();
  const { isLargeText } = useWindowLayout();
  const card = { width: '100%' as const, padding: CARD_PADDING, borderRadius: radius.lg, backgroundColor: colors.infoSurface };
  const currentText = (
    <NativeText variant="subhead" tone="secondary" tabular>
      {t('updateRequired.current', { version: current })}
    </NativeText>
  );
  const latestText = required ? (
    <NativeText variant="label" tabular>
      {t('updateRequired.latest', { version: required })}
    </NativeText>
  ) : null;

  if (isLargeText) {
    return (
      <Column alignment="center" spacing={spacing.xs} style={card}>
        {currentText}
        {latestText ? (
          <>
            <DecorativeIcon name={icons.chevronDown} size={16} color={colors.secondaryText} />
            {latestText}
          </>
        ) : null}
      </Column>
    );
  }
  return (
    <Row alignment="center" spacing={spacing.md} style={card}>
      <Spacer flexible />
      {currentText}
      {latestText ? (
        <>
          <DecorativeIcon name={icons.arrowRight} size={16} color={colors.secondaryText} />
          {latestText}
        </>
      ) : null}
      <Spacer flexible />
    </Row>
  );
}
