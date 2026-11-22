import PasswordChangeScreen from './password-change-screen';

/**
 * `PASSWORD_CHANGE_REQUIRED`의 새 비밀번호 등록 화면(로그인 전, 건너뛸 수 없음). 임시비밀번호와 90일 만료가 같은 흐름이며
 * 서버 `reason`에 따른 문구 선택은 `usePasswordChange`가 한다.
 */
export default function TempPasswordScreen() {
  return <PasswordChangeScreen variant="temporary" />;
}
