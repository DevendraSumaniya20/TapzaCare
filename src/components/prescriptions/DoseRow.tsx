import { Pressable, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { scale } from 'react-native-size-matters';
import { MIN_TAP_TARGET } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { Medicine } from '../../types/api';
import { withAlpha } from '../../utils/color';
import { AppText } from '../AppText';

const TICK = scale(30);

type Props = {
  medicine: Medicine;
  taken: boolean;
  onToggle: () => void;
};

/** One dose in the schedule. The whole row is the tap target, with a large tick on the right. */
export function DoseRow({ medicine, taken, onToggle }: Props) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: taken }}
      accessibilityLabel={`${medicine.name}, ${medicine.dose}`}
      accessibilityHint={taken ? undefined : t('prescriptions.markTaken')}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        {
          gap: spacing.md,
          paddingVertical: spacing.sm,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.text}>
        <AppText bold style={taken ? styles.done : null}>
          {medicine.name}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {medicine.dose} · {t('prescriptions.days', { count: medicine.days })}
        </AppText>
        {taken ? (
          <AppText variant="caption" bold color={colors.primary}>
            {t('prescriptions.taken')}
          </AppText>
        ) : null}
      </View>
      <View
        style={[
          styles.tick,
          {
            borderRadius: radius.pill,
            borderColor: taken
              ? colors.primary
              : withAlpha(colors.textSecondary, 0.5),
            backgroundColor: taken ? colors.primary : colors.surface,
          },
        ]}
      >
        {taken ? (
          <Check color={colors.surface} size={TICK * 0.6} strokeWidth={3} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TAP_TARGET + 12,
  },
  text: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  tick: {
    width: TICK,
    height: TICK,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
