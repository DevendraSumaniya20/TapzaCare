import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { FALLBACK_CONFIG } from '../constants/theme';
import type { RootState } from '../store';
import type {
  Booking,
  Doctor,
  LayoutConfig,
  Prescription,
  Slot,
} from '../types/api';
import { validateConfig } from '../utils/validateConfig';
import { loadCachedConfig, saveConfig } from './configCache';
import {
  mockRequest,
  type ConfigVariant,
  type MockRequest,
} from './mockServer';

export type ApiError = { status: number; message: string };

export type ConfigResult = {
  config: LayoutConfig;
  // network: fresh. cache: last good config, fetch failed. bundled: fetch failed and nothing cached.
  source: 'network' | 'cache' | 'bundled';
};

// Swap this function for a fetch-based one to talk to a real backend; endpoints below stay the same.
const mockBaseQuery: BaseQueryFn<MockRequest, unknown, ApiError> = async (
  request,
  { getState },
) => {
  const { status, data } = await mockRequest(
    request,
    (getState() as RootState).settings,
  );
  if (status >= 400) {
    return {
      error: {
        status,
        message:
          (data as { message?: string }).message ?? 'Something went wrong',
      },
    };
  }
  return { data };
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: mockBaseQuery,
  tagTypes: ['Slots'],
  endpoints: build => ({
    // The variant argument only keys the cache, so switching the day refetches. The mock picks the config itself.
    getConfig: build.query<ConfigResult, ConfigVariant>({
      queryFn: async (_variant, _api, _options, baseQuery) => {
        const response = await baseQuery({ method: 'GET', path: '/config' });
        if (!response.error) {
          try {
            const config = validateConfig(response.data);
            saveConfig(config);
            return { data: { config, source: 'network' } };
          } catch {
            // An invalid config is treated like a failed fetch: fall through to the last good one.
          }
        }
        const cached = await loadCachedConfig();
        return {
          data: cached
            ? { config: cached, source: 'cache' }
            : { config: FALLBACK_CONFIG, source: 'bundled' },
        };
      },
    }),
    getDoctors: build.query<Doctor[], void>({
      query: () => ({ method: 'GET', path: '/doctors' }),
    }),
    getSlots: build.query<Slot[], { doctorId: string; date: string }>({
      query: params => ({ method: 'GET', path: '/slots', params }),
      providesTags: ['Slots'],
    }),
    createBooking: build.mutation<
      Booking,
      { doctorId: string; slotId: string }
    >({
      query: body => ({ method: 'POST', path: '/bookings', body }),
    }),
    getPrescriptions: build.query<Prescription[], void>({
      query: () => ({ method: 'GET', path: '/prescriptions' }),
    }),
  }),
});

export const {
  useGetConfigQuery,
  useGetDoctorsQuery,
  useGetSlotsQuery,
  useCreateBookingMutation,
  useGetPrescriptionsQuery,
} = api;
