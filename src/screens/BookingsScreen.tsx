import { FlatList, StyleSheet, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { StateView } from '../components/StateView';
import { useOpenBooking } from '../hooks/useGoToTab';
import { useTheme } from '../hooks/useTheme';
import { useAppSelector } from '../store';
import type { LocalBooking } from '../store/bookingsSlice';
import { withAlpha } from '../utils/color';
import { formatDay, formatTime } from '../utils/date';

const STATUS_KEY = {
  queued: 'booking.statusQueued',
  pending: 'booking.statusPending',
  confirmed: 'booking.statusConfirmed',
  failed: 'booking.statusFailed',
} as const;

/** Bookings tab: every booking made on this device, newest first, with its current status. */
export function BookingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const openBooking = useOpenBooking();
  const bookings = useAppSelector(state => state.bookings);
  const language = useAppSelector(state => state.settings.language);

  const statusColor = (status: LocalBooking['status']) =>
    status === 'confirmed'
      ? colors.primary
      : status === 'failed'
      ? colors.textSecondary
      : colors.accent;

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          padding: spacing.lg,
          paddingTop: insets.top + spacing.lg,
          gap: spacing.md,
        },
      ]}
      data={bookings}
      keyExtractor={booking => booking.localId}
      ListHeaderComponent={
        <AppText
          variant="title"
          bold
          accessibilityRole="header"
          style={styles.title}
        >
          {t('bookings.title')}
        </AppText>
      }
      ListEmptyComponent={
        <StateView
          icon={CalendarDays}
          title={t('bookings.emptyTitle')}
          message={t('bookings.emptyMessage')}
          actionLabel={t('bookings.emptyAction')}
          onAction={() => openBooking()}
        />
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            {
              padding: spacing.lg,
              gap: spacing.xs,
              borderRadius: radius.md,
              borderColor: withAlpha(colors.textSecondary, 0.2),
              backgroundColor: colors.surface,
            },
          ]}
        >
          <AppText variant="subtitle" bold>
            {item.doctorName}
          </AppText>
          <AppText color={colors.textSecondary}>
            {formatDay(item.startsAt, language)} ·{' '}
            {formatTime(item.startsAt, language)}
          </AppText>
          <View
            style={[
              styles.status,
              {
                marginTop: spacing.xs,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: withAlpha(statusColor(item.status), 0.12),
              },
            ]}
          >
            <AppText variant="caption" bold color={statusColor(item.status)}>
              {t(STATUS_KEY[item.status])}
            </AppText>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  title: { textAlign: 'center' },
  card: { borderWidth: StyleSheet.hairlineWidth },
  status: { alignSelf: 'flex-start' },
});
