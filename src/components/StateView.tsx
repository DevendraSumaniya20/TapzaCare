import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { MIN_TAP_TARGET } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

type Props = {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Shared layout for empty and error states, so they look designed and alike everywhere. */
export function StateView({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: Props) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View style={[styles.container, { padding: spacing.xl, gap: spacing.sm }]}>
      <View
        style={{
          backgroundColor: colors.surface,
          padding: spacing.lg,
          borderRadius: radius.pill,
        }}
      >
        <Icon color={colors.primary} size={spacing.xxl} />
      </View>
      <AppText variant="subtitle" bold style={styles.centered}>
        {title}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.centered}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={[
            styles.action,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.xl,
              marginTop: spacing.sm,
            },
          ]}
        >
          <AppText bold color={colors.surface}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
  action: { minHeight: MIN_TAP_TARGET, justifyContent: 'center' },
});
