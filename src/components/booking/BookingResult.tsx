import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store';
import type { LocalBooking } from '../../store/bookingsSlice';
import { withAlpha } from '../../utils/color';
import { formatDay, formatTime } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';

const BADGE = scale(96);

type Props = {
  booking: LocalBooking;
  onChooseAnother: () => void;
  onDone: () => void;
};

/**
 * What the user sees right after confirming. It shows success immediately (the booking is still
 * 'pending'), then either settles to "confirmed" or flips to the failure state if the server refuses.
 */
export function BookingResult({ booking, onChooseAnother, onDone }: Props) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const language = useAppSelector(state => state.settings.language);
  const failed = booking.status === 'failed';

  const badge = useSharedValue(0);
  const icon = useSharedValue(0);
  // Replays whenever the outcome changes, so a late failure is as noticeable as the success was.
  useEffect(() => {
    badge.value = 0;
    icon.value = 0;
    badge.value = withSpring(1, { damping: 11 });
    icon.value = withDelay(160, withSpring(1, { damping: 9 }));
    if (failed) haptics.error();
    else haptics.success();
  }, [failed, badge, icon]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badge.value }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: icon.value }],
  }));
  const Icon = failed ? X : Check;
  const tone = failed ? colors.textSecondary : colors.primary;

  let status = t('booking.confirming');
  if (booking.status === 'confirmed') status = t('booking.confirmed');
  if (failed)
    status = t(
      booking.failure === 'slotTaken'
        ? 'booking.slotTaken'
        : 'booking.failedMessage',
    );

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          padding: spacing.xl,
          gap: spacing.md,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.badge,
          badgeStyle,
          {
            borderRadius: radius.pill,
            backgroundColor: tone,
            borderColor: withAlpha(tone, 0.25),
          },
        ]}
      >
        <Animated.View style={iconStyle}>
          <Icon color={colors.surface} size={BADGE * 0.5} strokeWidth={3} />
        </Animated.View>
      </Animated.View>

      <AppText variant="title" bold style={styles.centered}>
        {t(failed ? 'booking.failedTitle' : 'booking.successTitle')}
      </AppText>
      <AppText variant="subtitle" style={styles.centered}>
        {booking.doctorName}
      </AppText>
      <AppText bold color={colors.primary} style={styles.centered}>
        {formatDay(booking.startsAt, language)} ·{' '}
        {formatTime(booking.startsAt, language)}
      </AppText>
      <AppText color={colors.textSecondary} style={styles.centered}>
        {status}
      </AppText>

      <View style={[styles.action, { marginTop: spacing.lg }]}>
        {failed ? (
          <PrimaryButton
            label={t('booking.chooseAnother')}
            onPress={onChooseAnother}
          />
        ) : (
          <PrimaryButton label={t('booking.viewBookings')} onPress={onDone} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: BADGE,
    height: BADGE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: scale(8),
  },
  centered: { textAlign: 'center' },
  action: { alignSelf: 'stretch' },
});
