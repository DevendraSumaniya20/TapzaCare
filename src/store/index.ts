import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  configureStore,
  type ThunkAction,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../services/api';
import bookings, {
  BOOKINGS_STORAGE_KEY,
  syncQueuedBookings,
} from './bookingsSlice';
import doses from './dosesSlice';
import settings from './settingsSlice';

export const store = configureStore({
  reducer: {
    settings,
    bookings,
    doses,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(api.middleware),
});

// RTK Query listens for browser online/offline events by default; React Native has none, so feed it NetInfo.
// With refetchOnReconnect on the API, every query on screen refetches when the connection returns,
// and bookings made while offline are sent.
setupListeners(store.dispatch, (dispatch, { onOnline, onOffline }) =>
  NetInfo.addEventListener(state => {
    if (state.isConnected === false) {
      dispatch(onOffline());
    } else {
      dispatch(onOnline());
      store.dispatch(syncQueuedBookings());
    }
  }),
);

// Save the bookings list whenever it changes, so a queued booking survives the app being closed.
let savedBookings = store.getState().bookings;
store.subscribe(() => {
  const current = store.getState().bookings;
  if (current === savedBookings) return;
  savedBookings = current;
  AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(current)).catch(
    () => undefined,
  );
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<Result = void> = ThunkAction<
  Result,
  RootState,
  unknown,
  UnknownAction
>;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
