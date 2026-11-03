import Info from '@expo/material-symbols/info.xml';
import { Column, Icon, Row } from '@expo/ui';
import * as Application from 'expo-application';

import { SUPPORT } from '@/shared/config/support';
import { useTranslation } from '@/shared/i18n';
import { radius, spacing, useNativeColors } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

/** The quiet card at the bottom of the sign-in screen (where IDs come from, who to call) and the app version under it. */
export function LoginNotice() {
  const { t } = useTranslation();
  const colors = useNativeColors();

  return (
    <Column spacing={spacing.sm + spacing.xs} style={{ width: '100%', paddingHorizontal: spacing.lg }}>
      <Row
        alignment="start"
        spacing={spacing.sm + spacing.xs / 2}
        style={{ width: '100%', padding: spacing.md - 2, borderRadius: radius.lg, backgroundColor: colors.infoSurface }}>
        <Icon name={{ ios: 'info.circle', android: Info }} size={18} color={colors.secondaryText} />
        <NativeText variant="caption" tone="secondary">
          {t('auth.loginNotice', { phone: SUPPORT.display })}
        </NativeText>
      </Row>
      <Column alignment="center" style={{ width: '100%' }}>
        <NativeText variant="caption" tone="secondary" center>
          {t('auth.version', { version: Application.nativeApplicationVersion ?? '' })}
        </NativeText>
      </Column>
    </Column>
  );
}
