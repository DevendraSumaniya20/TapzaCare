import { useCallback, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type BottomSheet from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { BookingResult } from '../components/booking/BookingResult';
import { DateStrip } from '../components/booking/DateStrip';
import { DoctorPicker } from '../components/booking/DoctorPicker';
import { FlyingPhoto } from '../components/booking/FlyingPhoto';
import { SlotSheet } from '../components/booking/SlotSheet';
import { PrimaryButton } from '../components/PrimaryButton';
import { useGoToTab } from '../hooks/useGoToTab';
import { useTheme } from '../hooks/useTheme';
import type { Rect, RootStackParamList } from '../navigation/types';
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

  // Shared-element transition: the doctor's photo flies from where it was on Home to its card here.
  const photoOrigin = route.params?.photoOrigin;
  const [flying, setFlying] = useState(Boolean(photoOrigin));
  const [photoTarget, setPhotoTarget] = useState<Rect>();
  const screenRef = useRef<ComponentRef<typeof View>>(null);
  // Unknown until this screen has been laid out; the flying photo is not drawn before that,
  // or it would first appear in the wrong place.
  const [screenOffset, setScreenOffset] = useState<{ x: number; y: number }>();
  const endFlight = useCallback(() => setFlying(false), []);

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
    <View
      ref={screenRef}
      onLayout={() =>
        screenRef.current?.measureInWindow((x, y) => setScreenOffset({ x, y }))
      }
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
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
          firstId={route.params?.doctorId}
          onSelect={selected => setDoctorId(selected.id)}
          flight={
            flying && route.params?.doctorId
              ? { doctorId: route.params.doctorId, onTarget: setPhotoTarget }
              : undefined
          }
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
      {flying && photoOrigin && doctor && screenOffset ? (
        <FlyingPhoto
          uri={doctor.photoUrl}
          from={photoOrigin}
          to={photoTarget}
          offset={screenOffset}
          onDone={endFlight}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
