import { FlatList, Pressable, StyleSheet } from 'react-native';
import { scale } from 'react-native-size-matters';
import { MIN_TAP_TARGET } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store';
import { withAlpha } from '../../utils/color';
import { formatWeekday, nextDays, toDateKey } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';

const DAYS_AHEAD = 7;
const CHIP_WIDTH = scale(58);

type Props = {
  // YYYY-MM-DD
  selected: string;
  onSelect: (date: string) => void;
};

/** The next seven days as large chips: weekday above day number. */
export function DateStrip({ selected, onSelect }: Props) {
  const { colors, spacing, radius } = useTheme();
  const language = useAppSelector(state => state.settings.language);

  return (
    <FlatList
      horizontal
      data={nextDays(DAYS_AHEAD)}
      keyExtractor={toDateKey}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
      renderItem={({ item }) => {
        const key = toDateKey(item);
        const isSelected = key === selected;
        const textColor = isSelected ? colors.surface : colors.textPrimary;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={item.toDateString()}
            onPress={() => {
              haptics.select();
              onSelect(key);
            }}
            style={[
              styles.chip,
              {
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                borderColor: isSelected
                  ? colors.primary
                  : withAlpha(colors.textSecondary, 0.2),
                backgroundColor: isSelected ? colors.primary : colors.surface,
              },
            ]}
          >
            <AppText variant="caption" color={textColor}>
              {formatWeekday(item, language)}
            </AppText>
            <AppText variant="subtitle" bold color={textColor}>
              {item.getDate()}
            </AppText>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    width: CHIP_WIDTH,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
