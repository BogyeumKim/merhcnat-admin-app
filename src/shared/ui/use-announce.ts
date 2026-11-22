import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/** 나타날 때 VoiceOver/TalkBack으로 메시지를 읽어 준다. 네이티브 `Text`에는 live region이 없어 오류에 이 훅이 필요하다. */
export function useAnnounce(message: string | null) {
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
}
