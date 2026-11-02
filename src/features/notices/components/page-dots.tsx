import { View } from 'react-native';

import { spacing, useNativeColors } from '@/shared/theme';

/** Page indicator of the notice carousel. The current dot is the action color; the label ("2 / 3") is read by screen readers. */
export function PageDots({ count, index, label }: { count: number; index: number; label: string }) {
  const colors = useNativeColors();

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.sm }}>
      {Array.from({ length: count }, (_, position) => (
        <View
          key={position}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: position === index ? colors.action : colors.fieldBorder,
          }}
        />
      ))}
    </View>
  );
}
