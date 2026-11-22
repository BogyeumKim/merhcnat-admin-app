import { spacing } from '@/shared/theme';

/** 14pt 줄(약 20pt) 위아래 12pt = 44pt 터치 높이 (HIG 최소). */
export const LINK_TOUCH_PADDING = spacing.sm + spacing.xs;

export type LinkTextProps = {
  children: string;
  onPress: () => void;
  testID?: string;
  /** `strong`은 본문색(어두운) 링크(재전송 같은 액션), 기본값은 차분한 회색 링크. */
  tone?: 'quiet' | 'strong';
  /** 강조 액션 링크("인증번호 다시 받기", PDF p11): 굵은 글씨 + 본문색. `tone`보다 우선한다. */
  strong?: boolean;
};
