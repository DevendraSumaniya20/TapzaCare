import { useColorScheme } from 'react-native';
import { fontSize, radius, spacing } from '../constants/theme';
import { useAppSelector } from '../store';
import type { ThemeColors } from '../types/api';
import { isDark as isDarkColor } from '../utils/color';
import { useConfig } from './useConfig';

/**
 * Colours come from the remote config; spacing, type sizes and radii from the fixed scale.
 * Dark mode uses the config's `theme.dark` palette. A config without one stays light.
 */
export function useTheme() {
  const { config } = useConfig();
  const appearance = useAppSelector(state => state.settings.appearance);
  const systemScheme = useColorScheme();

  const wantsDark =
    appearance === 'system' ? systemScheme === 'dark' : appearance === 'dark';
  const isDark = wantsDark && config.theme.dark !== undefined;
  const colors: ThemeColors = (isDark && config.theme.dark) || config.theme;

  // Section backgrounds are arbitrary config colours, so components ask for "text for a dark
  // background" rather than a fixed colour. Which palette entry that is flips between themes.
  const surfaceIsDark = isDarkColor(colors.surface);
  return {
    colors,
    isDark,
    lightText: surfaceIsDark ? colors.textPrimary : colors.surface,
    darkText: surfaceIsDark ? colors.surface : colors.textPrimary,
    spacing,
    fontSize,
    radius,
  };
}

export type Theme = ReturnType<typeof useTheme>;
