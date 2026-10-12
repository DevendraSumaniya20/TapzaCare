import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type BottomSheet from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BookingResult } from '../components/booking/BookingResult';
import { DateStrip } from '../components/booking/DateStrip';
import { DoctorPicker } from '../components/booking/DoctorPicker';
import { SlotSheet } from '../components/booking/SlotSheet';
import { PrimaryButton } from '../components/PrimaryButton';
import { useGoToTab } from '../hooks/useGoToTab';
import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import { useGetDoctorsQuery } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store';
import { bookSlot } from '../store/bookingsSlice';
import type { Slot } from '../types/api';
import { withAlpha } from '../utils/color';
import { toDateKey } from '../utils/date';
import { formatInr } from '../utils/format';
import { haptics } from '../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

/**
 * Booking flow: choose doctor, choose date, pick a time in the bottom sheet, confirm.
 * Confirming is optimistic: the result view appears at once and follows the booking in the store.
 */
export function BookingScreen({ route }: Props) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const goToTab = useGoToTab();
  const sheetRef = useRef<BottomSheet>(null);

  const { data: doctors } = useGetDoctorsQuery();
  const [doctorId, setDoctorId] = useState(route.params?.doctorId);
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [bookingLocalId, setBookingLocalId] = useState<string>();

  const doctor = doctors?.find(candidate => candidate.id === doctorId);
  const booking = useAppSelector(state =>
    state.bookings.find(candidate => candidate.localId === bookingLocalId),
  );

  const confirm = (slot: Slot) => {
    if (!doctor) return;
    sheetRef.current?.close();
    setBookingLocalId(dispatch(bookSlot(doctor, slot, date)));
  };

  if (booking) {
    return (
      <BookingResult
        booking={booking}
        onDone={() => goToTab('bookings')}
        onChooseAnother={() => {
          setBookingLocalId(undefined);
          // The picker remounts with the sheet closed; the user reopens it on fresh slots.
        }}
      />
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingVertical: spacing.lg, gap: spacing.md }}
      >
        <AppText
          variant="subtitle"
          bold
          accessibilityRole="header"
          style={{ paddingHorizontal: spacing.lg }}
        >
          {t('booking.chooseDoctor')}
        </AppText>
        <DoctorPicker
          selectedId={doctorId}
          onSelect={selected => setDoctorId(selected.id)}
        />

        {doctor ? (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <AppText>
              {t('booking.fee', { fee: formatInr(doctor.feeInr) })}
            </AppText>
            <AppText color={colors.textSecondary}>
              {t('booking.speaks', { languages: doctor.languages.join(', ') })}
            </AppText>
          </View>
        ) : null}

        <AppText
          variant="subtitle"
          bold
          accessibilityRole="header"
          style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}
        >
          {t('booking.chooseDate')}
        </AppText>
        <DateStrip selected={date} onSelect={setDate} />
      </ScrollView>

      <View
        style={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: withAlpha(colors.textSecondary, 0.2),
        }}
      >
        <PrimaryButton
          label={t('booking.chooseTime')}
          disabled={!doctor}
          onPress={() => {
            haptics.tap();
            sheetRef.current?.expand();
          }}
        />
      </View>

      {/* Always mounted, so it is ready to open the moment a doctor is chosen. */}
      <SlotSheet
        sheetRef={sheetRef}
        doctorId={doctor?.id}
        date={date}
        onConfirm={confirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
