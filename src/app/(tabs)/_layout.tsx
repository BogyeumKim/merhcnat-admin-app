import { AppTabs } from '@/core/navigation/app-tabs';
import { useNoticePopupLauncher } from '@/features/notices';

export default function TabsLayout() {
  // 로그인 후 영역이 화면에 나타나면 로그인 공지 시트를 연다 (서버에 공지가 있을 때만).
  useNoticePopupLauncher();
  return <AppTabs />;
}
