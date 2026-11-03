import { LoginForm } from '../components/login-form';
import { useSignIn } from '../hooks/use-sign-in';

export default function SignInScreen() {
  const { pending, formError, passwordResetKey, submit } = useSignIn();

  return <LoginForm pending={pending} formError={formError} passwordResetKey={passwordResetKey} onSubmit={submit} />;
}
