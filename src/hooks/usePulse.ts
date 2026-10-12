import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Slow opacity pulse for skeleton placeholders. */
export function usePulse() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.45, { duration: 700 }), -1, true);
  }, [opacity]);
  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}
