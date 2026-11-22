import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/shared/i18n';
import { useScreenTopInset } from '@/shared/lib/use-screen-top-inset';
import { useNativeColors } from '@/shared/theme';

import { NativeButton } from './native-button';
import { NativeFormScroll } from './native-form-scroll';
import { NativeHost } from './native-host';
import { NativeText } from './native-text';

type ErrorScreenProps = {
  /** 이미 번역된 사용자용 메시지. */
  message?: string;
  onRetry?: () => void;
};

/** 크래시와 복구 불가 오류용 전체 화면 대체 UI. 네이티브로 스크롤하므로 어떤 글자 크기에서도 잘리지 않는다. */
export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topInset = useScreenTopInset();
  const native = useNativeColors();

  return (
    <View style={{ flex: 1, backgroundColor: native.background, paddingTop: topInset }}>
      <NativeHost fill>
        <NativeFormScroll bottomInset={insets.bottom}>
          <NativeText variant="title">{t('errors.screenTitle')}</NativeText>
          <NativeText tone="secondary">{message ?? t('errors.UNKNOWN')}</NativeText>
          {onRetry ? <NativeButton label={t('common.retry')} onPress={onRetry} /> : null}
        </NativeFormScroll>
      </NativeHost>
    </View>
  );
}
