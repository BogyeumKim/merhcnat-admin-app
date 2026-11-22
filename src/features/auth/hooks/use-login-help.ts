import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';
import { navigateOnce } from '@/shared/lib/navigation-lock';

export const HELP_ITEMS = ['id', 'pw', 'lock', 'phone', 'otp'] as const;
export type HelpItemId = (typeof HELP_ITEMS)[number];

const isHelpItem = (value: unknown): value is HelpItemId => HELP_ITEMS.some((id) => id === value);

/** "로그인이 안 되나요?" 시트의 상태: 열려 있는 질문(라우트가 하나를 열 수 있음, 예: `phone`), 전화 걸기와 닫기 동작. */
export function useLoginHelp() {
  const { open: initial } = useLocalSearchParams<{ open?: string }>();
  const [open, setOpen] = useState<HelpItemId | null>(isHelpItem(initial) ? initial : 'pw');

  return {
    open,
    toggle: (id: HelpItemId) => setOpen((current) => (current === id ? null : id)),
    call: () => {
      void Linking.openURL(`tel:${SUPPORT.phone}`);
    },
    close: () =>
      navigateOnce(() => {
        if (router.canGoBack()) router.back();
      }),
  };
}
