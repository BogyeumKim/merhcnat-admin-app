import { useNativeColors } from '@/shared/theme';

import { IconButton } from './icon-button';
import { icons } from './icons';

type ClearButtonProps = { label: string; onPress: () => void; testID?: string };

/**
 * 필드 끝의 "지우기" 컨트롤: 모든 플랫폼 텍스트 필드가 쓰는 채워진 원 안의 X 아이콘 하나
 *  (iOS는 SF Symbol `xmark.circle.fill`, Android는 Material Symbols가 outlined만 제공하므로 채워진 "cancel" 벡터).
 */
export function ClearButton({ label, onPress, testID }: ClearButtonProps) {
  const colors = useNativeColors();

  return <IconButton icon={icons.clear} label={label} onPress={onPress} testID={testID} size={20} color={colors.fieldBorder} />;
}
