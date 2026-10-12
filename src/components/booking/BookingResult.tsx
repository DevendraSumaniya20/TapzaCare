import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store';
import type { LocalBooking } from '../../store/bookingsSlice';
import { formatDay, formatTime } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';
import { SuccessBadge } from './SuccessBadge';

const FAIL_BADGE = scale(96);

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

  useEffect(() => {
    if (failed) haptics.error();
    else haptics.success();
  }, [failed]);

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
        { padding: spacing.xl, backgroundColor: colors.background },
      ]}
    >
      {failed ? (
        <Animated.View
          entering={ZoomIn.springify()}
          style={[
            styles.failBadge,
            {
              marginBottom: spacing.xl,
              borderRadius: radius.pill,
              backgroundColor: colors.textSecondary,
            },
          ]}
        >
          <X color={colors.surface} size={FAIL_BADGE * 0.5} strokeWidth={3} />
        </Animated.View>
      ) : (
        <SuccessBadge />
      )}

      {/* Keyed so the text and button animate in again if success flips to failure. */}
      <Animated.View
        key={failed ? 'failed' : 'ok'}
        entering={FadeInDown.delay(failed ? 100 : 350).duration(400)}
        style={[styles.text, { gap: spacing.sm }]}
      >
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
        <View style={{ marginTop: spacing.lg }}>
          {failed ? (
            <PrimaryButton
              label={t('booking.chooseAnother')}
              onPress={onChooseAnother}
            />
          ) : (
            <PrimaryButton label={t('booking.viewBookings')} onPress={onDone} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  failBadge: {
    width: FAIL_BADGE,
    height: FAIL_BADGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { alignSelf: 'stretch' },
  centered: { textAlign: 'center' },
});
