import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { ChevronRight, CloudOff, Pill } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import { AppText } from '../components/AppText';
import { StateView } from '../components/StateView';
import { usePulse } from '../hooks/usePulse';
import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import { useGetPrescriptionsQuery } from '../services/api';
import { useAppSelector } from '../store';
import { withAlpha } from '../utils/color';
import { formatDay } from '../utils/date';
import { haptics } from '../utils/haptics';

const CARD_MIN_HEIGHT = scale(104);

/** Prescriptions tab: the list from GET /prescriptions. Tapping one opens its dose schedule. */
export function PrescriptionsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const language = useAppSelector(state => state.settings.language);
  const {
    data: prescriptions,
    isLoading,
    isError,
    refetch,
  } = useGetPrescriptionsQuery(language);
  const pulse = usePulse();

  const cardStyle = [
    styles.card,
    {
      borderRadius: radius.md,
      borderColor: withAlpha(colors.textSecondary, 0.2),
      backgroundColor: colors.surface,
    },
  ];

  const title = (
    <AppText
      variant="title"
      bold
      accessibilityRole="header"
      style={styles.title}
    >
      {t('prescriptions.title')}
    </AppText>
  );
  const containerStyle = [
    styles.content,
    {
      padding: spacing.lg,
      paddingTop: insets.top + spacing.lg,
      gap: spacing.md,
    },
  ];

  if (isLoading) {
    return (
      <View style={[containerStyle, { backgroundColor: colors.background }]}>
        {title}
        <Animated.View
          accessibilityRole="progressbar"
          style={[pulse, { gap: spacing.md }]}
        >
          {[0, 1, 2].map(key => (
            <View
              key={key}
              style={[
                cardStyle,
                { backgroundColor: withAlpha(colors.textSecondary, 0.16) },
              ]}
            />
          ))}
        </Animated.View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={containerStyle}
      data={isError ? [] : prescriptions}
      keyExtractor={prescription => prescription.id}
      ListHeaderComponent={title}
      ListEmptyComponent={
        isError ? (
          <StateView
            icon={CloudOff}
            title={t('prescriptions.errorTitle')}
            message={t('booking.errorMessage')}
            actionLabel={t('common.retry')}
            onAction={refetch}
          />
        ) : (
          <StateView
            icon={Pill}
            title={t('prescriptions.emptyTitle')}
            message={t('prescriptions.emptyMessage')}
          />
        )
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.doctorName}, ${formatDay(
            item.issuedAt,
            language,
          )}`}
          onPress={() => {
            haptics.tap();
            navigation.navigate('PrescriptionDetail', {
              prescriptionId: item.id,
            });
          }}
          style={({ pressed }) => [
            cardStyle,
            styles.row,
            {
              padding: spacing.lg,
              gap: spacing.md,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={[styles.flex, { gap: spacing.xs }]}>
            <AppText variant="subtitle" bold>
              {item.doctorName}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {item.clinicName}
            </AppText>
            <AppText color={colors.textSecondary}>
              {t('prescriptions.issued', {
                date: formatDay(item.issuedAt, language),
              })}{' '}
              ·{' '}
              {t('prescriptions.medicineCount', {
                count: item.medicines.length,
              })}
            </AppText>
          </View>
          <ChevronRight color={colors.primary} size={spacing.xl} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  flex: { flex: 1 },
  title: { textAlign: 'center' },
  card: { minHeight: CARD_MIN_HEIGHT, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center' },
});
