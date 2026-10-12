import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  FileX,
  Moon,
  Sun,
  Sunrise,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { DoseRow } from '../components/prescriptions/DoseRow';
import { StateView } from '../components/StateView';
import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import { useGetPrescriptionsQuery } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleDose } from '../store/dosesSlice';
import type { DoseTiming } from '../types/api';
import { withAlpha } from '../utils/color';
import { formatDay, toDateKey } from '../utils/date';
import { haptics } from '../utils/haptics';
import { buildSchedule, doseKey } from '../utils/schedule';

type Props = NativeStackScreenProps<RootStackParamList, 'PrescriptionDetail'>;

const TIMING_ICON: Record<DoseTiming, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  night: Moon,
};
const TIMING_LABEL = {
  morning: 'prescriptions.morning',
  afternoon: 'prescriptions.afternoon',
  night: 'prescriptions.night',
} as const;

/** One prescription as today's schedule: morning, afternoon, night, each dose tickable. */
export function PrescriptionDetailScreen({ route }: Props) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.settings.language);
  const taken = useAppSelector(state => state.doses);
  // Same cache entry the list screen loaded, so this opens with no second request.
  const { data: prescriptions } = useGetPrescriptionsQuery(language);
  const prescription = prescriptions?.find(
    candidate => candidate.id === route.params.prescriptionId,
  );

  if (!prescription) {
    return (
      <StateView
        icon={FileX}
        title={t('prescriptions.notFound')}
        message={t('booking.errorMessage')}
      />
    );
  }

  const today = toDateKey(new Date());
  const schedule = buildSchedule(prescription);
  const keyFor = (medicineId: string, timing: DoseTiming) =>
    doseKey(today, prescription.id, medicineId, timing);
  const total = schedule.reduce(
    (sum, group) => sum + group.medicines.length,
    0,
  );
  const takenCount = schedule.reduce(
    (sum, group) =>
      sum +
      group.medicines.filter(
        medicine => taken[keyFor(medicine.id, group.timing)],
      ).length,
    0,
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <AppText variant="title" bold>
          {prescription.doctorName}
        </AppText>
        <AppText color={colors.textSecondary}>
          {prescription.clinicName}
        </AppText>
        <AppText color={colors.textSecondary}>
          {t('prescriptions.issued', {
            date: formatDay(prescription.issuedAt, language),
          })}
        </AppText>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText variant="subtitle" bold accessibilityRole="header">
          {t('prescriptions.todaySchedule')}
        </AppText>
        <AppText color={colors.textSecondary} accessibilityLiveRegion="polite">
          {t('prescriptions.progress', { taken: takenCount, total })}
        </AppText>
        <View
          style={[
            styles.track,
            {
              borderRadius: radius.pill,
              backgroundColor: withAlpha(colors.primary, 0.15),
            },
          ]}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${total === 0 ? 0 : (takenCount / total) * 100}%`,
                borderRadius: radius.pill,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {schedule.map(group => {
        const Icon = TIMING_ICON[group.timing];
        return (
          <View
            key={group.timing}
            style={[
              styles.card,
              {
                padding: spacing.lg,
                borderRadius: radius.md,
                borderColor: withAlpha(colors.textSecondary, 0.2),
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.row,
                { gap: spacing.sm, marginBottom: spacing.xs },
              ]}
            >
              <Icon color={colors.accent} size={spacing.xl} />
              <AppText variant="subtitle" bold accessibilityRole="header">
                {t(TIMING_LABEL[group.timing])}
              </AppText>
            </View>
            {group.medicines.map(medicine => {
              const key = keyFor(medicine.id, group.timing);
              const isTaken = Boolean(taken[key]);
              return (
                <DoseRow
                  key={medicine.id}
                  medicine={medicine}
                  taken={isTaken}
                  onToggle={() => {
                    if (isTaken) haptics.select();
                    else haptics.success();
                    dispatch(toggleDose(key));
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, overflow: 'hidden' },
  fill: { height: '100%' },
  card: { borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center' },
});
