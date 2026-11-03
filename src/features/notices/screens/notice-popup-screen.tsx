import { View } from 'react-native';

import { NoticeActions } from '../components/notice-actions';
import { NoticePager } from '../components/notice-pager';
import { PageDots } from '../components/page-dots';
import { useNoticePopup } from '../hooks/use-notice-popup';

/**
 * The sign-in notices as one bottom sheet sized to its content (`fitToContents`, so it is partial height on iOS and
 * Android alike). Several notices are a swipeable native pager with page dots; the sheet is as tall as the tallest page.
 */
export default function NoticePopupScreen() {
  const popup = useNoticePopup();
  const { notices, insets } = popup;

  return (
    <View style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
      <NoticePager
        notices={notices}
        width={popup.width}
        height={popup.pagerHeight}
        maxImageHeight={popup.maxImageHeight}
        onPageChange={popup.setIndex}
      />
      {notices.length > 1 ? <PageDots count={notices.length} index={popup.index} label={`${popup.index + 1} / ${notices.length}`} /> : null}
      <NoticeActions onHideToday={popup.hideAndClose} onClose={popup.close} bottomInset={insets.bottom} />
    </View>
  );
}
