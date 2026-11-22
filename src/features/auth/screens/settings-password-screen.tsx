import PasswordChangeScreen from './password-change-screen';

/** 로그인 중 설정 > 비밀번호 변경. 건너뛰기 없이 취소(또는 뒤로가기)로 설정에 돌아가고, 성공하면 로그인을 유지한 채 설정으로 돌아간다. */
export default function SettingsPasswordScreen() {
  return <PasswordChangeScreen variant="voluntary" />;
}
