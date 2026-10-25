import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Speaks a message through VoiceOver/TalkBack when it appears. Native `Text` has no live region, so errors need this. */
export function useAnnounce(message: string | null) {
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
}
