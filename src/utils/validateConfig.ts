import type {
  LayoutConfig,
  SectionBackground,
  SectionConfig,
  TabConfig,
  TabScreen,
  ThemeColors,
} from '../types/api';

type Json = Record<string, unknown>;

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'primary',
  'secondary',
  'background',
  'surface',
  'textPrimary',
  'textSecondary',
  'accent',
];
const TAB_SCREENS: TabScreen[] = [
  'home',
  'bookings',
  'prescriptions',
  'profile',
];
const BACKGROUND_KINDS: SectionBackground['kind'][] = [
  'color',
  'gradient',
  'image',
];

const isRecord = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

function parseTab(value: unknown): TabConfig | null {
  if (!isRecord(value)) return null;
  const { id, label, icon, screen } = value;
  if (!isText(id) || !isText(label) || !isText(icon)) return null;
  if (!TAB_SCREENS.includes(screen as TabScreen)) return null;
  return { id, label, icon, screen: screen as TabScreen };
}

function parseSection(value: unknown): SectionConfig | null {
  if (!isRecord(value)) return null;
  const { id, type, background, title, items } = value;
  if (!isText(id) || !isText(type) || !isRecord(background)) return null;
  const kind = background.kind as SectionBackground['kind'];
  if (!BACKGROUND_KINDS.includes(kind) || !isText(background.value))
    return null;
  return {
    id,
    type,
    background: { kind, value: background.value },
    title: isText(title) ? title : undefined,
    items: Array.isArray(items) ? items : [],
  };
}

/**
 * Turns an untrusted /config payload into a LayoutConfig.
 * Throws when the config cannot drive the app at all (no theme, no usable tab).
 * A single bad tab or section is dropped instead, so one admin typo cannot blank the home screen.
 */
export function validateConfig(input: unknown): LayoutConfig {
  if (!isRecord(input)) throw new Error('Config is not an object');
  if (typeof input.version !== 'number')
    throw new Error('Config version missing');

  const theme = input.theme;
  if (!isRecord(theme)) throw new Error('Config theme missing');
  const colors = {} as ThemeColors;
  for (const key of COLOR_KEYS) {
    const color = theme[key];
    if (!isText(color)) throw new Error(`Config theme.${key} missing`);
    colors[key] = color;
  }

  const festival = theme.festival;
  const hasFestival =
    isRecord(festival) &&
    isText(festival.name) &&
    isText(festival.greeting) &&
    isText(festival.bannerImageUrl);

  const tabs = (Array.isArray(input.tabs) ? input.tabs : [])
    .map(parseTab)
    .filter((tab): tab is TabConfig => tab !== null);
  if (tabs.length === 0) throw new Error('Config has no usable tabs');

  const sections = (Array.isArray(input.sections) ? input.sections : [])
    .map(parseSection)
    .filter((section): section is SectionConfig => section !== null);

  return {
    version: input.version,
    theme: hasFestival
      ? {
          ...colors,
          festival: {
            name: festival.name as string,
            greeting: festival.greeting as string,
            bannerImageUrl: festival.bannerImageUrl as string,
          },
        }
      : colors,
    tabs,
    sections,
  };
}
