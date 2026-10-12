import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api, type ApiError } from '../services/api';
import type { Doctor, Slot } from '../types/api';
import type { AppThunk } from './index';

/**
 * A booking as this device knows it. The brief has no GET /bookings, so the list lives on the client.
 * It is created as 'pending' the moment the user confirms, then reconciled with the server's answer.
 */
export type LocalBooking = {
  // Made on the device so the UI can follow one booking from tap to final answer.
  localId: string;
  // The server's id, known once it confirms.
  serverId?: string;
  doctorId: string;
  doctorName: string;
  slotId: string;
  startsAt: string;
  status: 'pending' | 'confirmed' | 'failed';
  failure?: 'slotTaken' | 'other';
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: [] as LocalBooking[],
  reducers: {
    bookingStarted: (state, action: PayloadAction<LocalBooking>) => {
      state.unshift(action.payload);
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
  },
});

export const { bookingStarted, bookingConfirmed, bookingFailed } =
  bookingsSlice.actions;
export default bookingsSlice.reducer;

/**
 * Optimistic booking: records it as pending and returns at once, so the success screen can show
 * without waiting. The POST runs in the background and settles the booking either way.
 */
export const bookSlot =
  (doctor: Doctor, slot: Slot, date: string): AppThunk<string> =>
  dispatch => {
    const localId = `local_${slot.id}_${Date.now()}`;
    dispatch(
      bookingStarted({
        localId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        slotId: slot.id,
        startsAt: slot.startsAt,
        status: 'pending',
      }),
    );

    dispatch(
      api.endpoints.createBooking.initiate({
        doctorId: doctor.id,
        slotId: slot.id,
        date,
      }),
    )
      .unwrap()
      .then(booking =>
        dispatch(bookingConfirmed({ localId, serverId: booking.id })),
      )
      .catch((error: ApiError) =>
        dispatch(
          bookingFailed({
            localId,
            failure: error?.status === 409 ? 'slotTaken' : 'other',
          }),
        ),
      );

    return localId;
  };
