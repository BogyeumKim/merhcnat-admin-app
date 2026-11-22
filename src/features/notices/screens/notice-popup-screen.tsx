import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { SheetGrabber } from '@/shared/ui/sheet-grabber';
import { SheetSurface } from '@/shared/ui/sheet-surface';

import { NoticeActions } from '../components/notice-actions';
import { NoticePager } from '../components/notice-pager';
import { PageDots } from '../components/page-dots';
import { useNoticePopup } from '../hooks/use-notice-popup';

/**
 * 로그인 공지를 내용 크기에 맞춘 하나의 바텀시트로 보여준다(`fitToContents`라 iOS·Android 모두 부분 높이).
 * 공지가 여러 개면 페이지 점이 있는 네이티브 페이저로 넘겨 보며, 시트 높이는 가장 큰 페이지에 맞춘다.
 * 아래로 끌어 닫을 수 있어 그래버를 보인다(iOS 네이티브, Android는 `SheetGrabber`가 이미지 위 별도 줄에 그림).
 * Android 넓은 창에서는 `SheetSurface`가 640dp 가운데 카드로 감싼다. 페이지 폭은 내용 컨테이너를 재서 정한다(`useNoticePopup`).
 */
export default function NoticePopupScreen() {
  const { t } = useTranslation();
  const popup = useNoticePopup();
  const { notices, insets } = popup;

  return (
    <SheetSurface dismissible>
      <View onLayout={popup.onContainerLayout} style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
      <SheetGrabber />
      <NoticePager
        notices={notices}
        width={popup.width}
        height={popup.pagerHeight}
        maxImageHeight={popup.maxImageHeight}
        index={popup.index}
        onPageChange={popup.setIndex}
      />
      {notices.length > 1 ? <PageDots count={notices.length} index={popup.index} label={t('notices.position', { index: popup.index + 1, count: notices.length })} /> : null}
      <NoticeActions onHideToday={popup.hideAndClose} onClose={popup.close} bottomInset={insets.bottom} />
      </View>
    </SheetSurface>
  );
}
