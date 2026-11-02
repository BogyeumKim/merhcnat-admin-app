import { ScrollView } from '@expo/ui';

import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

/** Platform-neutral fallback (not used on iOS/Android, which have their own files). */
export function NativeFormScroll({ children, bottomInset, footer }: NativeFormScrollProps) {
  return (
    <>
      <ScrollView>
        <FormColumn bottomPadding={bottomInset + spacing.md}>{children}</FormColumn>
      </ScrollView>
      {footer ? <FormFooter bottomPadding={bottomInset + spacing.md}>{footer}</FormFooter> : null}
    </>
  );
}
