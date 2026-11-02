import Account from '@expo/material-symbols/account_balance.xml';
import Campaign from '@expo/material-symbols/campaign.xml';
import CreditCard from '@expo/material-symbols/credit_card.xml';
import ErrorCircle from '@expo/material-symbols/error.xml';
import Help from '@expo/material-symbols/help.xml';
import Payments from '@expo/material-symbols/payments.xml';
import Receipt from '@expo/material-symbols/receipt_long.xml';
import RequestQuote from '@expo/material-symbols/request_quote.xml';
import Sms from '@expo/material-symbols/sms.xml';
import Storefront from '@expo/material-symbols/storefront.xml';
import Verified from '@expo/material-symbols/verified.xml';

import type { MenuItemId } from './catalog';

/** One icon per entry: SF Symbols on iOS, Material Symbols (XML vector drawables) on Android. */
export const MENU_ICONS = {
  manualPay: { ios: 'creditcard.fill', android: CreditCard },
  smsPay: { ios: 'message.fill', android: Sms },
  prepay: { ios: 'banknote.fill', android: Payments },
  transactions: { ios: 'doc.text.fill', android: Receipt },
  failedTransactions: { ios: 'exclamationmark.circle.fill', android: ErrorCircle },
  stores: { ios: 'storefront.fill', android: Storefront },
  deposits: { ios: 'building.columns.fill', android: Account },
  vatReport: { ios: 'percent', android: RequestQuote },
  preferredBusiness: { ios: 'checkmark.seal.fill', android: Verified },
  notices: { ios: 'megaphone.fill', android: Campaign },
  faq: { ios: 'questionmark.circle.fill', android: Help },
} as const satisfies Record<MenuItemId, { ios: string; android: unknown }>;
