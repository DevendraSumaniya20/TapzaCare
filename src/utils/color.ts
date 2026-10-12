type Rgb = [number, number, number];

function toRgb(color: string): Rgb | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? [...match[1]].map(char => char + char).join('')
      : match[1];
  return [0, 2, 4].map(start =>
    parseInt(hex.slice(start, start + 2), 16),
  ) as Rgb;
}

/**
 * True when light text reads better than dark text on this colour (WCAG relative luminance).
 * Section backgrounds come from the config, so text colour has to be decided at runtime.
 * Anything that is not a hex colour counts as light.
 */
export function isDark(color: string): boolean {
  const rgb = toRgb(color);
  if (!rgb) return false;
  const [r, g, b] = rgb.map(channel => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.25;
}

/** A theme colour at reduced opacity, for tints and scrims. Returns the input if it is not hex. */
export function withAlpha(color: string, alpha: number): string {
  const rgb = toRgb(color);
  return rgb ? `rgba(${rgb.join(', ')}, ${alpha})` : color;
}
