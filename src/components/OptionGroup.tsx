import { Pressable, StyleSheet, View } from 'react-native';
import { MIN_TAP_TARGET } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

type Props<T> = {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
};

/** A labelled row of pick-one chips. */
export function OptionGroup<T extends string | number>({
  label,
  options,
  selected,
  onSelect,
}: Props<T>) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{ gap: spacing.sm }}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
    >
      <AppText bold>{label}</AppText>
      <View style={[styles.row, { gap: spacing.sm }]}>
        {options.map(option => {
          const isSelected = option.value === selected;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.value)}
              style={[
                styles.chip,
                {
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.pill,
                  borderColor: colors.primary,
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                },
              ]}
            >
              <AppText
                color={isSelected ? colors.surface : colors.primary}
                bold={isSelected}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { minHeight: MIN_TAP_TARGET, justifyContent: 'center', borderWidth: 1 },
});
