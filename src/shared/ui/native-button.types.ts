import type { ReactElement } from 'react';

export type NativeButtonProps = {
  label: string;
  onPress: () => void;
  /** `tonal`은 옅은 회색 pill(주 버튼 아래 "닫기", 고객센터 연락), `ink`는 상태 화면의 어두운 pill(점검 "홈으로"). */
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'ink';
  disabled?: boolean;
  /**
   * 요청 진행 중: 라벨 자리에 네이티브 스피너를 보이고(버튼 크기·색 유지) 눌러도 아무 일도 하지 않는다.
   * 연타 방지의 동기 잠금은 여전히 `useRunOnce`가 맡는다(`loading`은 다시 렌더된 뒤에야 반영된다).
   */
  loading?: boolean;
  /** 라벨 앞 아이콘/마크(`@expo/ui` 요소, 장식용). 접근성 이름은 라벨(또는 `accessibilityLabel`)이 맡는다. */
  leading?: ReactElement;
  /** 보이는 라벨보다 구체적인 접근성 이름("카카오톡으로 고객센터 상담하기"). */
  accessibilityLabel?: string;
  testID?: string;
};
