import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { Rect } from '../../navigation/types';

type Props = {
  uri: string;
  // Where the photo was on the previous screen and where it belongs on this one, in window coordinates.
  from: Rect;
  // Undefined until the destination has been laid out; the photo waits at `from` until then.
  to?: Rect;
  // Window position of the view this is drawn in, to convert window coordinates to local ones.
  offset: { x: number; y: number };
  onDone: () => void;
};

/**
 * Shared-element transition done by hand: one photo drawn above the screen, moving and resizing from
 * its place on the previous screen to its place on this one. Reanimated's built-in shared transitions
 * do not run from a screen inside bottom tabs, which is where Home lives.
 */
export function FlyingPhoto({ uri, from, to, offset, onDone }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!to) return;
    progress.value = withTiming(
      1,
      { duration: 420, easing: Easing.out(Easing.cubic) },
      finished => {
        if (finished) scheduleOnRN(onDone);
      },
    );
  }, [to, progress, onDone]);

  const style = useAnimatedStyle(() => {
    const end = to ?? from;
    const size = interpolate(progress.value, [0, 1], [from.width, end.width]);
    return {
      left: interpolate(progress.value, [0, 1], [from.x, end.x]) - offset.x,
      top: interpolate(progress.value, [0, 1], [from.y, end.y]) - offset.y,
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  return <Animated.Image source={{ uri }} style={[styles.photo, style]} />;
}

const styles = StyleSheet.create({
  photo: { position: 'absolute' },
});
