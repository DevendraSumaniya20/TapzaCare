import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BADGE = scale(104);
const DOT = scale(10);
// Length of the tick path below, in its 24-unit viewBox. The stroke is revealed by shrinking a dash offset from this to 0.
const TICK_LENGTH = 20;
const DOT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** A ring that grows out of the badge and fades, like a ripple. */
function Ripple({
  progress,
  color,
}: {
  progress: SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.35, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 2]) }],
  }));
  return (
    <Animated.View
      style={[styles.circle, styles.layer, style, { backgroundColor: color }]}
    />
  );
}

/** One dot of the burst, flying outward along its angle and fading. */
function BurstDot({
  progress,
  angle,
  color,
}: {
  progress: SharedValue<number>;
  angle: number;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const distance = interpolate(
      progress.value,
      [0, 1],
      [BADGE * 0.4, BADGE * 0.95],
    );
    const radians = (angle * Math.PI) / 180;
    return {
      opacity: interpolate(progress.value, [0, 0.15, 1], [0, 1, 0]),
      transform: [
        { translateX: Math.cos(radians) * distance },
        { translateY: Math.sin(radians) * distance },
        { scale: interpolate(progress.value, [0, 1], [1, 0.4]) },
      ],
    };
  });
  return (
    <Animated.View
      style={[styles.dot, styles.layer, style, { backgroundColor: color }]}
    />
  );
}

/**
 * Booking success animation, in four beats on the UI thread:
 * the badge springs in, a ripple spreads, the tick is drawn stroke by stroke, and dots burst outward.
 */
export function SuccessBadge() {
  const { colors } = useTheme();
  const badge = useSharedValue(0);
  const ripple = useSharedValue(0);
  const tick = useSharedValue(0);
  const burst = useSharedValue(0);

  useEffect(() => {
    badge.value = withSpring(1, { damping: 12, stiffness: 160 });
    ripple.value = withDelay(
      120,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
    );
    tick.value = withDelay(
      260,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );
    burst.value = withDelay(
      420,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [badge, ripple, tick, burst]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badge.value }],
  }));
  const tickProps = useAnimatedProps(() => ({
    strokeDashoffset: TICK_LENGTH * (1 - tick.value),
  }));

  return (
    <View style={styles.stage}>
      <Ripple progress={ripple} color={colors.primary} />
      {DOT_ANGLES.map((angle, index) => (
        <BurstDot
          key={angle}
          progress={burst}
          angle={angle}
          color={index % 2 === 0 ? colors.accent : colors.primary}
        />
      ))}
      <Animated.View
        style={[
          styles.circle,
          styles.center,
          badgeStyle,
          { backgroundColor: colors.primary },
        ]}
      >
        <Svg width={BADGE * 0.56} height={BADGE * 0.56} viewBox="0 0 24 24">
          <AnimatedPath
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke={colors.surface}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={TICK_LENGTH}
            animatedProps={tickProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Twice the badge, so the ripple and dots have room without pushing the text below.
  stage: {
    width: BADGE * 2,
    height: BADGE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { width: BADGE, height: BADGE, borderRadius: BADGE / 2 },
  center: { alignItems: 'center', justifyContent: 'center' },
  layer: { position: 'absolute' },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
});
