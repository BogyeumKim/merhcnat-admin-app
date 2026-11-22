import { LoginForm } from '../components/login-form';
import { SessionEndedNotice } from '../components/session-ended-notice';
import { useSignIn } from '../hooks/use-sign-in';

/** 로그인 화면. 서버가 세션을 종료한 뒤에는 먼저 로그아웃 안내를 보여주고, 그 버튼이 폼을 드러낸다. 넓은 창(펼친 폴더블) 배치는 `BrandedLayout`이 맡는다. */
export default function SignInScreen() {
  const { pending, formError, passwordResetKey, formKey, sessionEnded, submit, dismissFormError, acknowledgeSessionEnded } = useSignIn();

  if (sessionEnded) return <SessionEndedNotice onContinue={acknowledgeSessionEnded} />;
  // `key`가 바뀌면(인증 흐름이 성공 없이 끝남) 폼을 새로 마운트한다: 새 네이티브 입력란이라 네이티브 ref 호출 없이
  // 아이디·비밀번호·폼 상태(값, 오류, touched, 지우기 버튼)가 모두 비고 자동 포커스도 없다.
  return (
    <LoginForm
      key={formKey}
      pending={pending}
      formError={formError}
      passwordResetKey={passwordResetKey}
      onSubmit={submit}
      onEdit={dismissFormError}
    />
  );
}
