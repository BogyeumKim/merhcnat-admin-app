export type OtpCodeFieldProps = {
  /** 서버가 코드를 거부함: 모든 칸을 오류로 표시. */
  invalid: boolean;
  /** 확인 중: 칸이 회색으로 잠기고 입력을 무시한다(포커스·키보드는 유지). */
  locked: boolean;
  /** 입력 시간이 지남: 칸이 비활성이 되고 입력란이 포커스를 놓는다. 새 코드를 받아야 한다. */
  disabled: boolean;
  /** 마운트 때 포커스해 키보드를 올린다. 코드 단계 진입·새 코드에서만 `true`(틀린 뒤 다시 마운트할 때는 `false`). */
  autoFocus: boolean;
  accessibilityLabel: string;
  testID?: string;
  /** 숫자만 남긴 현재 값(최대 6자리). 6자리가 되면 화면이 자동 제출한다. */
  onChange: (code: string) => void;
};
