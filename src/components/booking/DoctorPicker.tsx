import { useRef, type ComponentRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Stethoscope } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import { usePulse } from '../../hooks/usePulse';
import { useTheme } from '../../hooks/useTheme';
import { useGetDoctorsQuery } from '../../services/api';
import type { Rect } from '../../navigation/types';
import type { Doctor } from '../../types/api';
import { withAlpha } from '../../utils/color';
import { formatInr } from '../../utils/format';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';
import { RemoteImage } from '../RemoteImage';
import { StateView } from '../StateView';

const CARD_WIDTH = scale(150);
const CARD_HEIGHT = scale(168);
const PHOTO = scale(56);

type Props = {
  selectedId?: string;
  onSelect: (doctor: Doctor) => void;
  // Shown first in the list, so a doctor chosen before arriving is on screen without scrolling.
  firstId?: string;
  // While a photo is flying in for this doctor, their real photo stays hidden and reports where it sits.
  flight?: { doctorId: string; onTarget: (rect: Rect) => void };
};

/** Horizontal list of doctors from GET /doctors, with its own loading, error and empty states. */
export function DoctorPicker({ selectedId, onSelect, firstId, flight }: Props) {
  const flightPhoto = useRef<ComponentRef<typeof View>>(null);
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const { data: doctors, isLoading, isError, refetch } = useGetDoctorsQuery();
  const pulse = usePulse();

  if (isLoading) {
    return (
      <Animated.View
        accessibilityRole="progressbar"
        style={[
          styles.row,
          pulse,
          { paddingHorizontal: spacing.lg, gap: spacing.md },
        ]}
      >
        {[0, 1, 2].map(key => (
          <View
            key={key}
            style={[
              styles.card,
              {
                borderRadius: radius.md,
                backgroundColor: withAlpha(colors.textSecondary, 0.16),
              },
            ]}
          />
        ))}
      </Animated.View>
    );
  }

  // A failed refetch still leaves the last good list in `doctors`; only show the error with nothing to show.
  if (!doctors || doctors.length === 0) {
    return (
      <View style={styles.state}>
        <StateView
          icon={Stethoscope}
          title={t(
            isError ? 'booking.doctorsErrorTitle' : 'booking.doctorsEmptyTitle',
          )}
          message={t('booking.errorMessage')}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      </View>
    );
  }

  const ordered = [
    ...doctors.filter(doctor => doctor.id === firstId),
    ...doctors.filter(doctor => doctor.id !== firstId),
  ];

  return (
    <FlatList
      horizontal
      data={ordered}
      keyExtractor={doctor => doctor.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
      renderItem={({ item }) => {
        const selected = item.id === selectedId;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${item.name}, ${item.specialty}, ${formatInr(
              item.feeInr,
            )}`}
            onPress={() => {
              haptics.select();
              onSelect(item);
            }}
            style={[
              styles.card,
              styles.cardBorder,
              {
                padding: spacing.md,
                gap: spacing.xs,
                borderRadius: radius.md,
                borderColor: selected
                  ? colors.primary
                  : withAlpha(colors.textSecondary, 0.2),
                backgroundColor: selected
                  ? withAlpha(colors.primary, 0.08)
                  : colors.surface,
              },
            ]}
          >
            <View
              collapsable={false}
              ref={item.id === flight?.doctorId ? flightPhoto : undefined}
              onLayout={
                item.id === flight?.doctorId
                  ? () =>
                      flightPhoto.current?.measureInWindow(
                        (x, y, width, height) =>
                          flight.onTarget({ x, y, width, height }),
                      )
                  : undefined
              }
              style={[
                styles.photoBox,
                item.id === flight?.doctorId ? styles.hidden : null,
              ]}
            >
              <RemoteImage
                uri={item.photoUrl}
                style={[styles.photo, { borderRadius: radius.pill }]}
              />
            </View>
            <AppText bold numberOfLines={2}>
              {item.name}
            </AppText>
            <AppText
              variant="caption"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {item.specialty}
            </AppText>
            <AppText variant="caption" bold color={colors.primary}>
              {formatInr(item.feeInr)}
            </AppText>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  card: { width: CARD_WIDTH, minHeight: CARD_HEIGHT },
  cardBorder: { borderWidth: 1.5 },
  hidden: { opacity: 0 },
  photoBox: { alignSelf: 'flex-start' },
  photo: { width: PHOTO, height: PHOTO },
  state: { minHeight: CARD_HEIGHT * 1.6 },
});
