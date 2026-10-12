import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../src/store';
import { dosesLoaded, loadDoses, toggleDose } from '../src/store/dosesSlice';
import { toDateKey } from '../src/utils/date';
import { doseKey } from '../src/utils/schedule';

const today = toDateKey(new Date());
const todayKey = doseKey(today, 'rx_1', 'med_1', 'morning');
const oldKey = doseKey('2020-01-01', 'rx_1', 'med_1', 'morning');

beforeEach(async () => {
  store.dispatch(dosesLoaded({}));
  await AsyncStorage.removeItem('tapza.dosesTaken');
});

describe('taken doses on the device', () => {
  it('saves a taken dose so it survives a restart', async () => {
    store.dispatch(toggleDose(todayKey));
    expect(
      JSON.parse((await AsyncStorage.getItem('tapza.dosesTaken')) ?? '{}'),
    ).toEqual({
      [todayKey]: true,
    });
  });

  it('restores only the doses taken today', async () => {
    await AsyncStorage.setItem(
      'tapza.dosesTaken',
      JSON.stringify({ [todayKey]: true, [oldKey]: true }),
    );
    await store.dispatch(loadDoses());
    expect(store.getState().doses).toEqual({ [todayKey]: true });
  });

  it('starts with nothing ticked when storage is unreadable', async () => {
    await AsyncStorage.setItem('tapza.dosesTaken', 'not json');
    await store.dispatch(loadDoses());
    expect(store.getState().doses).toEqual({});
  });
});
