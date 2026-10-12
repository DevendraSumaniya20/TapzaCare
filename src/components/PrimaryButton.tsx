import { Pressable, StyleSheet } from 'react-native';
import { MIN_TAP_TARGET } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { withAlpha } from '../utils/color';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** The one filled call-to-action style. */
export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: radius.pill,
          backgroundColor: disabled
            ? withAlpha(colors.textSecondary, 0.3)
            : colors.primary,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <AppText bold color={colors.surface} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TAP_TARGET + 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
