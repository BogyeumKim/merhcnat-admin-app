import { AppTabs } from '@/core/navigation/app-tabs';
import { useNoticePopupLauncher } from '@/features/notices';

export default function TabsLayout() {
  // Opens the sign-in notice sheets (if the server has any) once the signed-in area is on screen.
  useNoticePopupLauncher();
  return <AppTabs />;
}
