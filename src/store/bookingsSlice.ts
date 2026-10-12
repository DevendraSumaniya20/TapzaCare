import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api, type ApiError } from '../services/api';
import type { Doctor, Slot } from '../types/api';
import type { AppThunk } from './index';

export const BOOKINGS_STORAGE_KEY = 'tapza.bookings';

/**
 * A booking as this device knows it. The brief has no GET /bookings, so the list lives on the client.
 *
 * Life of a booking:
 *   online:  pending  -> confirmed | failed
 *   offline: queued   -> (connection returns) -> pending -> confirmed | failed
 */
export type LocalBooking = {
  // Made on the device so the UI can follow one booking from tap to final answer.
  localId: string;
  // The server's id, known once it confirms.
  serverId?: string;
  doctorId: string;
  doctorName: string;
  slotId: string;
  // YYYY-MM-DD of the slot; needed to update the cached slot list when the booking is sent.
  date: string;
  startsAt: string;
  status: 'queued' | 'pending' | 'confirmed' | 'failed';
  failure?: 'slotTaken' | 'other';
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: [] as LocalBooking[],
  reducers: {
    bookingStarted: (state, action: PayloadAction<LocalBooking>) => {
      state.unshift(action.payload);
    },
    // A queued booking is now being sent.
    bookingSubmitted: (state, action: PayloadAction<string>) => {
      const booking = state.find(
        candidate => candidate.localId === action.payload,
      );
      if (booking) booking.status = 'pending';
    },
    bookingConfirmed: (
      state,
      action: PayloadAction<{ localId: string; serverId: string }>,
    ) => {
      const booking = state.find(
        candidate => candidate.localId === action.payload.localId,
      );
      if (!booking) return;
      booking.status = 'confirmed';
      booking.serverId = action.payload.serverId;
    },
    bookingFailed: (
      state,
      action: PayloadAction<{
        localId: string;
        failure: 'slotTaken' | 'other';
      }>,
    ) => {
      const booking = state.find(
        candidate => candidate.localId === action.payload.localId,
      );
      if (!booking) return;
      booking.status = 'failed';
      booking.failure = action.payload.failure;
    },
    // Restored from storage. A booking that was mid-request when the app closed has an unknown
    // outcome, so it goes back in the queue to be sent again.
    bookingsLoaded: (_state, action: PayloadAction<LocalBooking[]>) =>
      action.payload.map(booking =>
        booking.status === 'pending'
          ? { ...booking, status: 'queued' }
          : booking,
      ),
  },
});

export const {
  bookingStarted,
  bookingSubmitted,
  bookingConfirmed,
  bookingFailed,
  bookingsLoaded,
} = bookingsSlice.actions;
export default bookingsSlice.reducer;

/** Sends one booking to the server and records the answer. */
const submitBooking =
  (booking: LocalBooking): AppThunk =>
  dispatch => {
    const { localId, doctorId, slotId, date } = booking;
    dispatch(bookingSubmitted(localId));
    dispatch(api.endpoints.createBooking.initiate({ doctorId, slotId, date }))
      .unwrap()
      .then(result =>
        dispatch(bookingConfirmed({ localId, serverId: result.id })),
      )
      .catch((error: ApiError) =>
        dispatch(
          bookingFailed({
            localId,
            failure: error?.status === 409 ? 'slotTaken' : 'other',
          }),
        ),
      );
  };

/**
 * Optimistic booking: records it and returns at once, so the result screen can show without waiting.
 * Online, the POST runs in the background and settles the booking either way.
 * Offline, the booking waits in the queue until syncQueuedBookings runs.
 */
export const bookSlot =
  (doctor: Doctor, slot: Slot, date: string): AppThunk<string> =>
  (dispatch, getState) => {
    const online = getState().api.config.online;
    const booking: LocalBooking = {
      localId: `local_${slot.id}_${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      slotId: slot.id,
      date,
      startsAt: slot.startsAt,
      status: online ? 'pending' : 'queued',
    };
    dispatch(bookingStarted(booking));
    if (online) dispatch(submitBooking(booking));
    return booking.localId;
  };

/** Sends every queued booking. Called when the connection returns and after bookings load at startup. */
export const syncQueuedBookings = (): AppThunk => (dispatch, getState) => {
  if (!getState().api.config.online) return;
  getState()
    .bookings.filter(booking => booking.status === 'queued')
    .forEach(booking => dispatch(submitBooking(booking)));
};

/** Restores bookings saved by an earlier run, then sends any that were waiting. */
export const loadBookings = (): AppThunk => async dispatch => {
  try {
    const saved: unknown = JSON.parse(
      (await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY)) ?? '[]',
    );
    if (Array.isArray(saved)) dispatch(bookingsLoaded(saved as LocalBooking[]));
  } catch {
    // Unreadable storage only means starting with an empty list.
  }
  dispatch(syncQueuedBookings());
};
