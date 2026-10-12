import AsyncStorage from '@react-native-async-storage/async-storage';
import { FALLBACK_CONFIG } from '../src/constants/theme';
import { normalConfig } from '../src/data/configs';
import { api } from '../src/services/api';
import { resetMockServer, setConfigOverride } from '../src/services/mockServer';
import { store } from '../src/store';
import { setFailure, setLatency } from '../src/store/settingsSlice';

// The brief: "a failed config must leave the app usable" and "cache the last good config".
const fetchConfig = () =>
  store
    .dispatch(
      api.endpoints.getConfig.initiate(
        { variant: 'normal', language: 'en' },
        { forceRefetch: true },
      ),
    )
    .unwrap();

beforeEach(async () => {
  resetMockServer();
  store.dispatch(setLatency(0));
  store.dispatch(setFailure('none'));
  await AsyncStorage.removeItem('tapza.lastGoodConfig');
});
afterAll(() => {
  store.dispatch(setFailure('none'));
  store.dispatch(api.util.resetApiState());
});

describe('GET /config fallback chain', () => {
  it('serves the fresh config and saves it', async () => {
    const result = await fetchConfig();
    expect(result.source).toBe('network');
    expect(result.config.version).toBe(normalConfig.version);
    expect(await AsyncStorage.getItem('tapza.lastGoodConfig')).toContain(
      '"version":12',
    );
  });

  it('falls back to the last good config when the server fails', async () => {
    await fetchConfig();
    store.dispatch(setFailure('config'));

    const result = await fetchConfig();
    expect(result.source).toBe('cache');
    expect(result.config).toEqual(normalConfig);
  });

  it('falls back to the bundled config when the server fails and nothing was saved', async () => {
    store.dispatch(setFailure('config'));
    expect(await fetchConfig()).toEqual({
      config: FALLBACK_CONFIG,
      source: 'bundled',
    });
  });

  it('treats an invalid config from the server like a failure, and does not save it', async () => {
    await fetchConfig();
    setConfigOverride('normal', { ...normalConfig, version: 50, tabs: [] });

    const result = await fetchConfig();
    expect(result.source).toBe('cache');
    expect(result.config.version).toBe(normalConfig.version);
  });

  it('ignores a corrupted saved config', async () => {
    await AsyncStorage.setItem('tapza.lastGoodConfig', '{not json');
    store.dispatch(setFailure('config'));
    expect((await fetchConfig()).source).toBe('bundled');
  });
});
