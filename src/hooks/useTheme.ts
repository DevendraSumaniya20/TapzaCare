import { fontSize, radius, spacing } from '../constants/theme';
import { useConfig } from './useConfig';

/** Colours come from the remote config; spacing, type sizes and radii from the fixed scale. */
export function useTheme() {
  const { config } = useConfig();
  return { colors: config.theme, spacing, fontSize, radius };
}

export type Theme = ReturnType<typeof useTheme>;
