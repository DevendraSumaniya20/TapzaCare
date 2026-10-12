import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ConfigVariant,
  FailureMode,
  MockSettings,
} from '../services/mockServer';

// Controls for the mock backend. Read by the API layer on every request.
const initialState: MockSettings = {
  variant: 'normal',
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
    setLatency: (state, action: PayloadAction<number>) => {
      state.latencyMs = action.payload;
    },
    setFailure: (state, action: PayloadAction<FailureMode>) => {
      state.failure = action.payload;
    },
  },
});

export const { setVariant, setLatency, setFailure } = settingsSlice.actions;
export default settingsSlice.reducer;
