import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import { usePulse } from '../../hooks/usePulse';
import { useTheme } from '../../hooks/useTheme';
import { withAlpha } from '../../utils/color';

function Block({
  color,
  width,
  height,
  round,
}: {
  color: string;
  width: DimensionValue;
  height: number;
  round?: number;
}) {
  const { radius } = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: round ?? radius.sm,
        backgroundColor: color,
      }}
    />
  );
}

/** First-load placeholder shaped like the real home: header, hero, chips, action tiles, service cards. */
export function HomeSkeleton() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const pulseStyle = usePulse();

  const block = withAlpha(colors.textSecondary, 0.16);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[
        styles.container,
        pulseStyle,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
          paddingBottom: spacing.xl,
          backgroundColor: block,
        }}
      >
        <Block color={block} width="55%" height={scale(34)} />
        <Block
          color={block}
          width="100%"
          height={scale(52)}
          round={radius.md}
        />
        <Block color={block} width="70%" height={scale(26)} />
        <Block color={block} width="50%" height={scale(16)} />
      </View>
      <View style={[styles.row, { padding: spacing.lg, gap: spacing.sm }]}>
        {[0, 1, 2, 3, 4].map(key => (
          <View key={key} style={[styles.centered, { gap: spacing.xs }]}>
            <Block
              color={block}
              width={scale(52)}
              height={scale(52)}
              round={radius.md}
            />
            <Block color={block} width={scale(44)} height={scale(10)} />
          </View>
        ))}
      </View>
      <View style={[styles.row, { padding: spacing.lg, gap: spacing.sm }]}>
        {[0, 1, 2, 3].map(key => (
          <View
            key={key}
            style={[styles.flex, styles.centered, { gap: spacing.xs }]}
          >
            <Block
              color={block}
              width={scale(56)}
              height={scale(56)}
              round={radius.md}
            />
            <Block color={block} width={scale(48)} height={scale(10)} />
          </View>
        ))}
      </View>
      <View style={[styles.row, { padding: spacing.lg, gap: spacing.md }]}>
        {[0, 1].map(key => (
          <View key={key} style={[styles.flex, { gap: spacing.sm }]}>
            <Block
              color={block}
              width="100%"
              height={scale(110)}
              round={radius.md}
            />
            <Block color={block} width="80%" height={scale(12)} />
            <Block color={block} width="40%" height={scale(16)} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  centered: { alignItems: 'center' },
});
