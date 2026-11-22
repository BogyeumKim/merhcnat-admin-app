import type { Icon } from '@expo/ui';
import type { ComponentProps } from 'react';

export type DecorativeIconProps = {
  name: ComponentProps<typeof Icon>['name'];
  size?: number;
  color?: string;
};
