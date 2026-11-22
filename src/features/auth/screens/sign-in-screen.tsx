import { useDoubleBackToExit } from '@/shared/lib/use-double-back-to-exit';

import { LoginForm } from '../components/login-form';
import { SessionEndedNotice } from '../components/session-ended-notice';
import { useSignIn } from '../hooks/use-sign-in';

/** 로그인 화면. 서버가 세션을 종료한 뒤에는 먼저 로그아웃 안내를 보여주고, 그 버튼이 폼을 드러낸다. 넓은 창(펼친 폴더블) 배치는 `BrandedLayout`이 맡는다. */
export default function SignInScreen() {
  const { pending, formError, passwordResetKey, sessionEnded, submit, dismissFormError, acknowledgeSessionEnded } = useSignIn();
  // 자동 포커스 없음: 화면에 들어와도 키보드를 올리지 않는다. 사용자가 입력란을 눌러 시작한다.
  // Android 뒤로가기: 로그인 폼이 보일 때만 한 번 더 눌러야 앱을 닫는다(디자인 1-1). 세션 종료 안내가 보이는 동안은
  // 끄고, 안내의 `useBlockBackButton(true, 'exit')`가 한 번에 앱을 끝낸다(차단 화면 공통).
  useDoubleBackToExit(!sessionEnded);

  if (sessionEnded) return <SessionEndedNotice onContinue={acknowledgeSessionEnded} />;
  // 인증 흐름(2단계 인증 시트, 로그인 전 비밀번호 변경)이 성공 없이 끝나 돌아와도 폼은 그대로다(아이디·비밀번호 유지).
  return (
    <LoginForm
      pending={pending}
      formError={formError}
      passwordResetKey={passwordResetKey}
      onSubmit={submit}
      onEdit={dismissFormError}
    />
  );
}
