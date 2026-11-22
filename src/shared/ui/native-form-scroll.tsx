import { ScrollView } from '@expo/ui';

import { spacing } from '@/shared/theme';

import { FormColumn } from './form-column';
import { FormFooter } from './form-footer';
import type { NativeFormScrollProps } from './native-form-scroll.types';

/** 플랫폼 공용 대체 구현 (iOS/Android는 각자 파일이 있어 쓰이지 않는다). */
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
