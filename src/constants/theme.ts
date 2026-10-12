import { moderateScale, scale } from 'react-native-size-matters';
import type { LayoutConfig } from '../types/api';

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(24),
  xxl: scale(32),
};

// moderateScale keeps text from ballooning on tablets; OS font scaling still applies on top.
export const fontSize = {
  caption: moderateScale(12),
  body: moderateScale(15),
  subtitle: moderateScale(17),
  title: moderateScale(22),
  display: moderateScale(28),
};

export const radius = {
  sm: scale(8),
  md: scale(14),
  lg: scale(22),
  pill: 999,
};

// Accessibility floor for anything tappable.
export const MIN_TAP_TARGET = 44;

/**
 * Last resort when /config fails and nothing is cached yet: the app still opens with its tabs.
 * The only place colours are written outside the remote config.
 */
export const FALLBACK_CONFIG: LayoutConfig = {
  version: 0,
  theme: {
    primary: '#0F766E',
    secondary: '#134E4A',
    background: '#F4F8F7',
    surface: '#FFFFFF',
    textPrimary: '#10231F',
    textSecondary: '#4B635E',
    accent: '#D97706',
  },
  tabs: [
    { id: 'home', label: 'Home', icon: 'home', screen: 'home' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar', screen: 'bookings' },
    {
      id: 'prescriptions',
      label: 'Prescriptions',
      icon: 'pill',
      screen: 'prescriptions',
    },
    { id: 'profile', label: 'Profile', icon: 'user', screen: 'profile' },
  ],
  sections: [],
};
