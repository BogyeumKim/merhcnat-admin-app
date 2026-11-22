import type { Icon } from '@expo/ui';
import type { ComponentProps } from 'react';

export type IconButtonProps = {
  icon: ComponentProps<typeof Icon>['name'];
  /** 번역된 접근성 이름 (아이콘만 있는 버튼이므로 필수). */
  label: string;
  onPress: () => void;
  /** 글리프 크기. 터치 영역은 항상 44pt 정사각형이다. */
  size?: number;
  color: string;
  /** SF Symbol 굵기 (iOS 전용, Android Material Symbols는 무시). 생략하면 시스템 기본. */
  weight?: 'regular' | 'medium' | 'semibold';
  testID?: string;
};

/** 아이콘 전용 버튼의 터치 영역 (Apple HIG 44pt, Material 48dp 이상은 Host/행 높이가 보장). */
export const ICON_BUTTON_TARGET = 44;
