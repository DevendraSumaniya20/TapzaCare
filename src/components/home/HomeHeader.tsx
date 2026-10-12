import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin, Search, Sparkles, Sun, UserRound } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MIN_TAP_TARGET } from '../../constants/theme';
import { useGoToTab } from '../../hooks/useGoToTab';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../store';
import { setVariant } from '../../store/settingsSlice';
import { withAlpha } from '../../utils/color';
import { haptics } from '../../utils/haptics';
import { AppText } from '../AppText';

type Props = {
  scrollY: SharedValue<number>;
  // Colour for the clinic row, which sits directly on the first section's background.
  topRowColor: string;
  // Shown when the config on screen is not fresh from the server.
  isStale: boolean;
  onRetry: () => void;
  onHeight: (height: number) => void;
};

/**
 * Floating home header. At rest: clinic row + search bar, transparent over the hero.
 * On scroll the clinic row slides away and fades, and a solid backdrop fades in behind the search bar.
 */
export function HomeHeader({
  scrollY,
  topRowColor,
  isStale,
  onRetry,
  onHeight,
}: Props) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const variant = useAppSelector(state => state.settings.variant);
  const goToTab = useGoToTab();
  // Measured rather than fixed, so large OS font sizes still collapse by the right amount.
  const topRowHeight = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -Math.min(Math.max(scrollY.value, 0), topRowHeight.value) },
    ],
  }));
  const topRowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, topRowHeight.value * 0.6 + 1],
      [1, 0],
      'clamp',
    ),
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [topRowHeight.value * 0.4, topRowHeight.value + 1],
      [0, 1],
      'clamp',
    ),
  }));

  const isFestival = variant === 'festival';
  const DayIcon = isFestival ? Sun : Sparkles;

  return (
    <Animated.View
      style={[styles.header, headerStyle, { paddingTop: insets.top }]}
      onLayout={event => onHeight(event.nativeEvent.layout.height)}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          backdropStyle,
          {
            backgroundColor: colors.surface,
            borderBottomColor: withAlpha(colors.textSecondary, 0.2),
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.row,
          topRowStyle,
          {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.sm,
            gap: spacing.sm,
          },
        ]}
        onLayout={event => {
          topRowHeight.value = event.nativeEvent.layout.height;
        }}
      >
        <MapPin color={topRowColor} size={spacing.xl} />
        <View style={styles.flex}>
          <AppText variant="caption" color={topRowColor}>
            {t('home.yourClinic')}
          </AppText>
          <AppText bold color={topRowColor} numberOfLines={1}>
            {t('home.clinicName')}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('profile.title')}
          onPress={() => {
            haptics.tap();
            goToTab('profile');
          }}
          style={[
            styles.iconButton,
            { borderRadius: radius.pill, backgroundColor: colors.surface },
          ]}
        >
          <UserRound color={colors.primary} size={spacing.xl} />
        </Pressable>
      </Animated.View>

      <View
        style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}
      >
        <View
          style={[
            styles.row,
            styles.search,
            {
              gap: spacing.sm,
              paddingLeft: spacing.md,
              paddingRight: spacing.xs,
              borderRadius: radius.md,
              borderColor: withAlpha(colors.textSecondary, 0.25),
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Search color={colors.textSecondary} size={spacing.xl} />
          <AppText
            color={colors.textSecondary}
            numberOfLines={1}
            style={styles.flex}
          >
            {t('home.searchPlaceholder')}
          </AppText>
          {/* Demo switch between the two shipped configs, placed where Zepto puts its season toggle. */}
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: isFestival }}
            accessibilityLabel={t('profile.festivalDay')}
            onPress={() => {
              haptics.select();
              dispatch(setVariant(isFestival ? 'normal' : 'festival'));
            }}
            style={[
              styles.row,
              styles.dayPill,
              {
                gap: spacing.xs,
                paddingHorizontal: spacing.md,
                borderRadius: radius.sm,
                backgroundColor: withAlpha(colors.accent, 0.14),
              },
            ]}
          >
            <DayIcon color={colors.accent} size={spacing.lg} />
            <AppText variant="caption" bold color={colors.accent}>
              {t(isFestival ? 'home.normalDay' : 'home.festivalDay')}
            </AppText>
          </Pressable>
        </View>
      </View>

      {isStale ? (
        <View
          style={[
            styles.row,
            {
              gap: spacing.sm,
              marginHorizontal: spacing.lg,
              marginBottom: spacing.sm,
              paddingLeft: spacing.md,
              borderRadius: radius.sm,
              backgroundColor: colors.textPrimary,
            },
          ]}
        >
          <AppText variant="caption" color={colors.surface} style={styles.flex}>
            {t('home.savedContent')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={[styles.retry, { paddingHorizontal: spacing.md }]}
          >
            <AppText variant="caption" bold color={colors.surface}>
              {t('common.retry')}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  iconButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    minHeight: MIN_TAP_TARGET + 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dayPill: { minHeight: MIN_TAP_TARGET },
  retry: { minHeight: MIN_TAP_TARGET, justifyContent: 'center' },
});
