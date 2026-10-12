// Source of truth for app-owned strings. hi.ts and te.ts must match this shape (checked by TypeScript).
// Content that arrives in /config (tab labels, section titles, items) is localised by the server instead.
export const en = {
  common: {
    retry: 'Try again',
  },
  offline: {
    title: 'No internet connection',
    message:
      'Check your Wi-Fi or mobile data. This screen will close by itself when you are back online.',
  },
  home: {
    yourClinic: 'Your clinic',
    clinicName: 'Sri Sai Clinic, Kukatpally',
    searchPlaceholder: 'Search doctors, tests, medicines',
    festivalDay: 'Festival',
    normalDay: 'Normal',
    celebrate: 'Celebrate',
    savedContent: 'Server unreachable. Showing saved content.',
    nextAvailable: 'Next',
    emptyTitle: 'Nothing to show right now',
    emptyMessage: 'We could not load your clinic services. Please try again.',
  },
  bookings: {
    emptyTitle: 'No bookings yet',
    emptyMessage: 'Appointments you book will appear here.',
  },
  prescriptions: {
    emptyTitle: 'No prescriptions yet',
    emptyMessage: 'Prescriptions from your doctor will appear here.',
  },
  profile: {
    title: 'Profile',
    language: 'Language',
    demoControls: 'Demo controls for the mock server',
    configVersion: 'Config version {{version}}',
    homeLayout: 'Home layout',
    normalDay: 'Normal day',
    festivalDay: 'Festival day',
    networkSpeed: 'Network speed',
    instant: 'Instant',
    normal: 'Normal',
    slow: 'Slow (3s)',
    failRequests: 'Fail requests',
    failNone: 'None',
    failConfig: 'Config',
    failBookings: 'Bookings',
    failAll: 'Everything',
    sourceNetwork: 'Fresh from server',
    sourceCache: 'Saved copy (server unreachable)',
    sourceBundled: 'Built-in default (server unreachable, nothing saved)',
  },
};

export type Translations = typeof en;
