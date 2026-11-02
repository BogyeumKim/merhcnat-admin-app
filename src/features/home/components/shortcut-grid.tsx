import { Column, Row } from '@expo/ui';

import { useCapabilities } from '@/features/auth';
import { openMenuItem, visibleItemIds } from '@/features/menu';
import { useTranslation } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { NativeText } from '@/shared/ui/native-text';

import { IconBadge } from './amount-row';
import { HomeCard } from './home-card';
import { HOME_SHORTCUTS, HOME_SHORTCUT_COUNT } from '../model/shortcuts';

/** Four icon tiles of the entries this account uses most (the icon grid of Travel Wallet's home). */
export function ShortcutGrid() {
  const { t } = useTranslation();
  const allowed = visibleItemIds(useCapabilities());
  const items = HOME_SHORTCUTS.filter((item) => allowed.includes(item.id)).slice(0, HOME_SHORTCUT_COUNT);

  return (
    <HomeCard>
      <Row style={{ width: '100%' }}>
        {items.map((item) => (
          <Column
            key={item.id}
            testID={`home-shortcut-${item.id}`}
            onPress={() => openMenuItem(item.id)}
            alignment="center"
            spacing={spacing.xs}
            style={{ width: `${100 / HOME_SHORTCUT_COUNT}%`, paddingHorizontal: 2 }}>
            <IconBadge icon={item.icon} />
            <NativeText variant="caption" center>{t(`home.shortcut.${item.id}`)}</NativeText>
          </Column>
        ))}
      </Row>
    </HomeCard>
  );
}
