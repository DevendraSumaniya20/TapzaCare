/* eslint-env jest */

// Native modules that have no JS fallback under Jest.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => store.get(key) ?? null),
      setItem: jest.fn(async (key, value) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async key => {
        store.delete(key);
      }),
    },
  };
});

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// Hand-written because notifee's own mock is an ES module Jest cannot load here.
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    createChannel: jest.fn(async () => 'channel'),
    createTriggerNotification: jest.fn(async () => 'id'),
    cancelTriggerNotifications: jest.fn(async () => undefined),
    getTriggerNotificationIds: jest.fn(async () => []),
  },
  AndroidImportance: { HIGH: 4 },
  AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1 },
  RepeatFrequency: { DAILY: 1 },
  TriggerType: { TIMESTAMP: 0 },
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-haptic-feedback', () => ({ trigger: jest.fn() }));

require('react-native-reanimated').setUpTests();
