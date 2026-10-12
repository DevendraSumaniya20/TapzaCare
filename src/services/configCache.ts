import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LayoutConfig } from '../types/api';
import { validateConfig } from '../utils/validateConfig';

const KEY = 'tapza.lastGoodConfig';

export async function saveConfig(config: LayoutConfig): Promise<void> {
  // A full disk must not break the screen that just loaded fine.
  await AsyncStorage.setItem(KEY, JSON.stringify(config)).catch(
    () => undefined,
  );
}

export async function loadCachedConfig(): Promise<LayoutConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    // Re-validated: the cache may have been written by an older app version.
    return raw ? validateConfig(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
