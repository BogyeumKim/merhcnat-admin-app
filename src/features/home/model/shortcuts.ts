import Account from '@expo/material-symbols/account_balance.xml';
import CreditCard from '@expo/material-symbols/credit_card.xml';
import Receipt from '@expo/material-symbols/receipt_long.xml';
import RequestQuote from '@expo/material-symbols/request_quote.xml';
import Sms from '@expo/material-symbols/sms.xml';
import Storefront from '@expo/material-symbols/storefront.xml';

import type { MenuItemId } from '@/features/menu';

/** Entries the home grid may show, in priority order, with their icons. The grid takes the first four the account may use. */
export const HOME_SHORTCUTS = [
  { id: 'manualPay', icon: { ios: 'creditcard.fill', android: CreditCard } },
  { id: 'smsPay', icon: { ios: 'message.fill', android: Sms } },
  { id: 'transactions', icon: { ios: 'doc.text.fill', android: Receipt } },
  { id: 'deposits', icon: { ios: 'building.columns.fill', android: Account } },
  { id: 'stores', icon: { ios: 'storefront.fill', android: Storefront } },
  { id: 'vatReport', icon: { ios: 'percent', android: RequestQuote } },
] as const satisfies readonly { id: MenuItemId; icon: { ios: string; android: unknown } }[];
export const HOME_SHORTCUT_COUNT = 4;
