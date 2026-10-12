import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../i18n';
import type {
  ConfigVariant,
  FailureMode,
  MockSettings,
} from '../services/mockServer';

// Controls for the mock backend. Read by the API layer on every request.
export type Appearance = 'system' | 'light' | 'dark';

// The mock-backend controls, plus the one purely local preference: appearance.
const initialState: MockSettings & { appearance: Appearance } = {
  variant: 'normal',
  language: 'en',
  latencyMs: 600,
  failure: 'none',
  appearance: 'system',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setVariant: (state, action: PayloadAction<ConfigVariant>) => {
      state.variant = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setAppearance: (state, action: PayloadAction<Appearance>) => {
      state.appearance = action.payload;
    },
    setLatency: (state, action: PayloadAction<number>) => {
      state.latencyMs = action.payload;
    },
    setFailure: (state, action: PayloadAction<FailureMode>) => {
      state.failure = action.payload;
    },
  },
});

export const {
  setVariant,
  setLanguage,
  setAppearance,
  setLatency,
  setFailure,
} = settingsSlice.actions;
export default settingsSlice.reducer;
