import NetInfo from '@react-native-community/netinfo';
import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { FALLBACK_CONFIG } from '../constants/theme';
import type { Language } from '../i18n';
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
  // The mock lives in the app and would answer without a network. Fail like a real request would,
  // so offline behaviour (cached config, error states) is the same as with a real backend.
  if ((await NetInfo.fetch()).isConnected === false) {
    return { error: { status: 0, message: 'No internet connection' } };
  }
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
  refetchOnReconnect: true,
  tagTypes: ['Slots'],
  endpoints: build => ({
    // The argument only keys the cache, so switching day or language refetches. The mock reads both itself.
    getConfig: build.query<
      ConfigResult,
      { variant: ConfigVariant; language: Language }
    >({
      queryFn: async (_key, _api, _options, baseQuery) => {
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
    // `date` is not sent; it identifies which cached slot list to update.
    createBooking: build.mutation<
      Booking,
      { doctorId: string; slotId: string; date: string }
    >({
      query: ({ doctorId, slotId }) => ({
        method: 'POST',
        path: '/bookings',
        body: { doctorId, slotId },
      }),
      // Optimistic update: the slot shows as taken immediately. If the server refuses, undo it.
      async onQueryStarted(
        { doctorId, slotId, date },
        { dispatch, queryFulfilled },
      ) {
        const patch = dispatch(
          api.util.updateQueryData('getSlots', { doctorId, date }, slots => {
            const slot = slots.find(candidate => candidate.id === slotId);
            if (slot) slot.available = false;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      // Reconcile: whatever happened, refetch slots so the list matches the server.
      invalidatesTags: ['Slots'],
    }),
    // Keyed by language so switching language refetches the translated list.
    getPrescriptions: build.query<Prescription[], Language>({
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
