import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../i18n';
import type {
  ConfigVariant,
  FailureMode,
  MockSettings,
} from '../services/mockServer';

// Controls for the mock backend. Read by the API layer on every request.
const initialState: MockSettings = {
  variant: 'normal',
  language: 'en',
  latencyMs: 600,
  failure: 'none',
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
    setLatency: (state, action: PayloadAction<number>) => {
      state.latencyMs = action.payload;
    },
    setFailure: (state, action: PayloadAction<FailureMode>) => {
      state.failure = action.payload;
    },
  },
});

export const { setVariant, setLanguage, setLatency, setFailure } =
  settingsSlice.actions;
export default settingsSlice.reducer;
