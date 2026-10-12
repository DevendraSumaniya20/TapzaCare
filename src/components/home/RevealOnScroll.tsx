import type { ReactNode } from 'react';
import { useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { HomeScrollContext } from './HomeScrollContext';

// How far a section travels into the viewport before it is fully shown.
const REVEAL_DISTANCE = 140;
const RISE = 28;

/** Fades and lifts its child in as it scrolls up past the bottom edge of the screen. Runs on the UI thread. */
export function RevealOnScroll({ children }: { children: ReactNode }) {
  const scrollY = useContext(HomeScrollContext);
  const { height: viewportHeight } = useWindowDimensions();
  // Position inside the scroll content. Starts at 0, which reads as "already on screen", so nothing hides before layout.
  const top = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    const pastBottomEdge = (scrollY?.value ?? 0) + viewportHeight - top.value;
    const progress = interpolate(
      pastBottomEdge,
      [0, REVEAL_DISTANCE],
      [0, 1],
      'clamp',
    );
    return {
      opacity: progress,
      transform: [{ translateY: (1 - progress) * RISE }],
    };
  });

  return (
    <Animated.View
      style={style}
      onLayout={event => {
        top.value = event.nativeEvent.layout.y;
      }}
    >
      {children}
    </Animated.View>
  );
}
