import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking } from 'react-native';

import { SUPPORT } from '@/shared/config/support';

export const HELP_ITEMS = ['id', 'pw', 'lock', 'phone', 'otp'] as const;
export type HelpItemId = (typeof HELP_ITEMS)[number];

const isHelpItem = (value: unknown): value is HelpItemId => HELP_ITEMS.some((id) => id === value);

/** State of the "로그인이 안 되나요?" sheet: which question is open (the route may open one, for example `phone`) and the call action. */
export function useLoginHelp() {
  const { open: initial } = useLocalSearchParams<{ open?: string }>();
  const [open, setOpen] = useState<HelpItemId | null>(isHelpItem(initial) ? initial : 'pw');

  return {
    open,
    toggle: (id: HelpItemId) => setOpen((current) => (current === id ? null : id)),
    close: () => (router.canGoBack() ? router.back() : router.replace('/sign-in')),
    call: () => {
      void Linking.openURL(`tel:${SUPPORT.phone}`);
    },
  };
}
