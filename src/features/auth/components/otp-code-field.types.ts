export type OtpCodeFieldProps = {
  /** 서버가 코드를 거부함: 모든 칸을 오류로 표시. */
  invalid: boolean;
  accessibilityLabel: string;
  testID?: string;
  /** 숫자만 남긴 현재 값(최대 6자리). 6자리가 되면 화면이 자동 제출한다. */
  onChange: (code: string) => void;
};
