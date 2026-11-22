import { AccessibilityInfo } from 'react-native';
import { toast } from 'sonner-native';

type ToastInput = {
  /**
   * 고정 id. 같은 id로 다시 표시하면 복사본을 쌓지 않고 보이는 토스트를 갱신한다(흔들림 포함). 그래서
   *  실패하는 버튼을 열 번 눌러도 오류 토스트는 열 개가 아니라 하나다. id가 다르면 쌓인다.
   */
  id: string;
  /** 이미 번역된 문자열. */
  title: string;
  description?: string;
};

const ERROR_DURATION_MS = 6000;

/** 일시적 시스템 오류 (네트워크, 타임아웃, 요청 제한). 입력 실수는 여기가 아니라 인라인으로 표시한다. */
export function showErrorToast({ id, title, description }: ToastInput) {
  AccessibilityInfo.announceForAccessibility(description ? `${title}. ${description}` : title);
  toast.error(title, { id, description, duration: ERROR_DURATION_MS });
}

/** 가벼운 확인 알림 ("코드를 보냈습니다"). */
export function showSuccessToast({ id, title, description }: ToastInput) {
  AccessibilityInfo.announceForAccessibility(description ? `${title}. ${description}` : title);
  toast.success(title, { id, description });
}
