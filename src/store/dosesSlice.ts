import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toDateKey } from '../utils/date';
import type { AppThunk } from './index';

const STORAGE_KEY = 'tapza.dosesTaken';

// Keys from utils/schedule doseKey. Present = taken. The brief has no endpoint for this, so it lives on the device.
type DosesState = Record<string, true>;

const dosesSlice = createSlice({
  name: 'doses',
  initialState: {} as DosesState,
  reducers: {
    doseToggled: (state, action: PayloadAction<string>) => {
      if (state[action.payload]) delete state[action.payload];
      else state[action.payload] = true;
    },
    dosesLoaded: (_state, action: PayloadAction<DosesState>) => action.payload,
  },
});

export const { doseToggled, dosesLoaded } = dosesSlice.actions;
export default dosesSlice.reducer;

/** Marks or unmarks a dose and saves, so a taken dose is still ticked after the app restarts. */
export const toggleDose =
  (key: string): AppThunk =>
  (dispatch, getState) => {
    dispatch(doseToggled(key));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(getState().doses)).catch(
      () => undefined,
    );
  };

/** Restores today's ticks. Older days are dropped, which also keeps the stored list from growing forever. */
export const loadDoses = (): AppThunk => async dispatch => {
  try {
    const saved: unknown = JSON.parse(
      (await AsyncStorage.getItem(STORAGE_KEY)) ?? '{}',
    );
    if (typeof saved !== 'object' || saved === null) return;
    const today = toDateKey(new Date());
    const todays: DosesState = {};
    for (const key of Object.keys(saved)) {
      if (key.startsWith(`${today}|`)) todays[key] = true;
    }
    dispatch(dosesLoaded(todays));
  } catch {
    // Unreadable storage only means starting with nothing ticked.
  }
};
