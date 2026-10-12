import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MIN_TAP_TARGET } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import {
  disableReminders,
  enableReminders,
  hasReminders,
  sendTestReminder,
} from '../../services/reminders';
import type { Prescription } from '../../types/api';
import { withAlpha } from '../../utils/color';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';

/** Switch that turns daily medicine reminders for one prescription on or off. */
export function ReminderCard({ prescription }: { prescription: Prescription }) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    hasReminders(prescription.id)
      .then(setEnabled)
      .catch(() => undefined);
  }, [prescription.id]);

  const toggle = async (next: boolean) => {
    haptics.select();
    // Move the switch at once; put it back if the OS says no.
    setEnabled(next);
    try {
      if (next) {
        const granted = await enableReminders(prescription);
        setDenied(!granted);
        if (!granted) setEnabled(false);
      } else {
        await disableReminders(prescription);
      }
    } catch {
      setEnabled(!next);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          padding: spacing.lg,
          gap: spacing.sm,
          borderRadius: radius.md,
          borderColor: withAlpha(colors.textSecondary, 0.2),
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={[styles.row, { gap: spacing.md }]}>
        <Bell color={colors.primary} size={spacing.xl} />
        <View style={styles.flex}>
          <AppText bold>{t('reminders.toggle')}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {t('reminders.hint')}
          </AppText>
        </View>
        <Switch
          accessibilityLabel={t('reminders.toggle')}
          value={enabled}
          onValueChange={toggle}
          thumbColor={colors.surface}
          trackColor={{
            false: withAlpha(colors.textSecondary, 0.4),
            true: colors.primary,
          }}
        />
      </View>
      {denied ? (
        <AppText
          variant="caption"
          color={colors.accent}
          accessibilityLiveRegion="polite"
        >
          {t('reminders.denied')}
        </AppText>
      ) : null}
      {enabled ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.tap();
            sendTestReminder(prescription).catch(() => undefined);
          }}
          style={styles.test}
        >
          <AppText variant="caption" bold color={colors.primary}>
            {t('reminders.test')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  test: { minHeight: MIN_TAP_TARGET, justifyContent: 'center' },
});
