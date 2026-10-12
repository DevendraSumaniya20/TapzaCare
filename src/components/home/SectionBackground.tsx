import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import type { SectionBackground as Background } from '../../types/api';
import { isDark, withAlpha } from '../../utils/color';
import { RemoteImage } from '../RemoteImage';

const gradientColors = (value: string) => {
  const colors = value.split(',').map(color => color.trim());
  // LinearGradient needs two stops; a single colour becomes a flat fill.
  return colors.length > 1 ? colors : [value, value];
};

/** Fills its parent with the section's configured background. */
export function SectionBackground({ background }: { background: Background }) {
  const { colors } = useTheme();
  // Destructured because Reanimated's Babel plugin mistakes `x.value` inside a style for a shared value.
  const { kind, value } = background;

  if (kind === 'gradient') {
    return (
      <LinearGradient
        colors={gradientColors(value)}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  if (kind === 'image') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <RemoteImage
          uri={value}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {/* Scrim keeps text readable over any photo an admin picks. */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: withAlpha(colors.textPrimary, 0.5) },
          ]}
        />
      </View>
    );
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: value }]} />;
}

/** Text colour that stays readable on this background. */
export function useSectionTextColor(background: Background): string {
  const { colors } = useTheme();
  if (background.kind === 'image') return colors.surface;
  const base =
    background.kind === 'gradient'
      ? gradientColors(background.value)[0]
      : background.value;
  return isDark(base) ? colors.surface : colors.textPrimary;
}
