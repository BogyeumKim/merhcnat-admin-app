import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { navigateOnce } from '@/shared/lib/navigation-lock';
import { useWindowLayout } from '@/shared/theme';

export const HELP_ITEMS = ['id', 'pw', 'lock', 'phone', 'otp'] as const;
export type HelpItemId = (typeof HELP_ITEMS)[number];

/** 보통 처음 펼쳐 두는 항목(디자인 1-3). */
const DEFAULT_OPEN: HelpItemId = 'pw';
/**
 * 이보다 낮은 창에서는 모두 접힌 채 연다: 펼친 답변이 목록을 밀어 다른 질문이 화면 밖으로 나가지 않게 한다.
 * 접힌 iPhone Duo(678pt), 펼친 Duo 가로(669pt), 휴대폰 가로·분할 화면이 해당하고 일반 휴대폰 세로(약 800 이상)는 아니다.
 */
const EXPANDED_MIN_HEIGHT = 700;

const isHelpItem = (value: unknown): value is HelpItemId => HELP_ITEMS.some((id) => id === value);

/**
 * "로그인이 안 되나요?" 시트의 상태: 펼친 질문 하나(하나를 펼치면 다른 항목은 접힌다)와 닫기.
 * 처음 펼침: 라우트 `open`(예: Google OTP 화면에서 `otp`, 받을 곳 선택에서 `phone`)이 있으면 그 항목, 짧은 창은 모두 접힘, 그 외 `pw`.
 * 처음 연 시점에만 정한다: 연 채로 창 크기가 바뀌어도 사용자가 펼친 상태를 바꾸지 않는다.
 */
export function useLoginHelp() {
  const { open: requested } = useLocalSearchParams<{ open?: string }>();
  const { height, isShort } = useWindowLayout();
  const [open, setOpen] = useState<HelpItemId | null>(() => {
    if (isHelpItem(requested)) return requested;
    return isShort || height < EXPANDED_MIN_HEIGHT ? null : DEFAULT_OPEN;
  });

  return {
    open,
    toggle: (id: HelpItemId) => setOpen((current) => (current === id ? null : id)),
    close: () =>
      navigateOnce(() => {
        if (router.canGoBack()) router.back();
      }),
  };
}
