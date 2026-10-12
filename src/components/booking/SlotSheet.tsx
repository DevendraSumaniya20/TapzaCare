import { useState, type RefObject } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { CalendarX, CloudOff } from 'lucide-react-native';
import { skipToken } from '@reduxjs/toolkit/query';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MIN_TAP_TARGET } from '../../constants/theme';
import { usePulse } from '../../hooks/usePulse';
import { useTheme } from '../../hooks/useTheme';
import { useGetSlotsQuery } from '../../services/api';
import { useAppSelector } from '../../store';
import type { Slot } from '../../types/api';
import { withAlpha } from '../../utils/color';
import { formatTime } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';
import { PrimaryButton } from '../PrimaryButton';
import { StateView } from '../StateView';

const SNAP_POINTS = ['70%'];
const EVENING_STARTS_AT_HOUR = 15;

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
);

type Props = {
  sheetRef: RefObject<BottomSheet | null>;
  // Undefined until the user has chosen a doctor; nothing is fetched until then.
  doctorId?: string;
  // YYYY-MM-DD
  date: string;
  onConfirm: (slot: Slot) => void;
};

/**
 * Bottom sheet for picking a time. Dragged with the finger: pull down or tap outside to close.
 * Shows the slots for one doctor and date, with loading, empty and error states.
 */
export function SlotSheet({ sheetRef, doctorId, date, onConfirm }: Props) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const language = useAppSelector(state => state.settings.language);
  const pulse = usePulse();
  const {
    data: slots,
    isFetching,
    isError,
    refetch,
  } = useGetSlotsQuery(doctorId ? { doctorId, date } : skipToken);
  const [selectedId, setSelectedId] = useState<string>();
  // Slot ids contain doctor and date, so a selection from another doctor or day simply stops matching.
  // A slot can also become unavailable after it was picked (refetch, or someone else booked it).
  const selected = slots?.find(
    slot => slot.id === selectedId && slot.available,
  );

  const chipStyle = [styles.chip, { borderRadius: radius.sm }];

  const renderGroup = (title: string, group: Slot[]) =>
    group.length === 0 ? null : (
      <View style={{ gap: spacing.sm }}>
        <AppText variant="caption" bold color={colors.textSecondary}>
          {title}
        </AppText>
        <View style={[styles.grid, { gap: spacing.sm }]}>
          {group.map(slot => {
            const isSelected = slot.id === selected?.id;
            return (
              <Pressable
                key={slot.id}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: isSelected,
                  disabled: !slot.available,
                }}
                disabled={!slot.available}
                onPress={() => {
                  haptics.select();
                  setSelectedId(slot.id);
                }}
                style={[
                  chipStyle,
                  styles.chipBorder,
                  {
                    borderColor: isSelected
                      ? colors.primary
                      : withAlpha(colors.textSecondary, 0.25),
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                  },
                  slot.available ? null : styles.unavailable,
                ]}
              >
                <AppText
                  bold={isSelected}
                  color={isSelected ? colors.surface : colors.textPrimary}
                  style={slot.available ? null : styles.struck}
                >
                  {formatTime(slot.startsAt, language)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    );

  const isEvening = (slot: Slot) =>
    new Date(slot.startsAt).getHours() >= EVENING_STARTS_AT_HOUR;

  let body;
  if (isFetching) {
    // Same grid as the real slots, so nothing jumps when they arrive.
    body = (
      <Animated.View
        accessibilityRole="progressbar"
        style={[styles.grid, pulse, { gap: spacing.sm }]}
      >
        {Array.from({ length: 9 }, (_, key) => (
          <View
            key={key}
            style={[
              chipStyle,
              { backgroundColor: withAlpha(colors.textSecondary, 0.16) },
            ]}
          />
        ))}
      </Animated.View>
    );
  } else if (isError && !slots) {
    body = (
      <StateView
        icon={CloudOff}
        title={t('booking.slotsErrorTitle')}
        message={t('booking.errorMessage')}
        actionLabel={t('common.retry')}
        onAction={refetch}
      />
    );
  } else if (!slots || slots.length === 0) {
    body = (
      <StateView
        icon={CalendarX}
        title={t('booking.noSlotsTitle')}
        message={t('booking.noSlotsMessage')}
      />
    );
  } else {
    body = (
      <View style={{ gap: spacing.lg }}>
        {renderGroup(
          t('booking.morning'),
          slots.filter(slot => !isEvening(slot)),
        )}
        {renderGroup(t('booking.evening'), slots.filter(isEvening))}
      </View>
    );
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{
        backgroundColor: withAlpha(colors.textSecondary, 0.4),
      }}
    >
      <AppText
        variant="subtitle"
        bold
        accessibilityRole="header"
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}
      >
        {t('booking.slotsTitle')}
      </AppText>
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
        ]}
      >
        {body}
      </BottomSheetScrollView>
      <View
        style={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: withAlpha(colors.textSecondary, 0.2),
        }}
      >
        <PrimaryButton
          disabled={!selected}
          label={
            selected
              ? t('booking.confirm', {
                  time: formatTime(selected.startsAt, language),
                })
              : t('booking.pickSlotFirst')
          }
          onPress={() => {
            if (selected) onConfirm(selected);
          }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    flexBasis: '31%',
    minHeight: MIN_TAP_TARGET + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBorder: { borderWidth: 1 },
  unavailable: { opacity: 0.4 },
  struck: { textDecorationLine: 'line-through' },
});
