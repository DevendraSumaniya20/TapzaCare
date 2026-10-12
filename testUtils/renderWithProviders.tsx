import type { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import '../src/i18n';
import { api } from '../src/services/api';
import { store } from '../src/store';
import { setFailure, setLatency } from '../src/store/settingsSlice';

/** Renders a component inside the providers every screen expects: the Redux store and navigation. */
export const renderWithProviders = (element: ReactElement) =>
  render(
    <Provider store={store}>
      <NavigationContainer>{element}</NavigationContainer>
    </Provider>,
  );

/**
 * Call in beforeAll: makes the mock instant and loads the config, so components render with their
 * final theme straight away instead of updating after the test has finished.
 */
export async function prepareStore() {
  store.dispatch(setLatency(0));
  store.dispatch(setFailure('none'));
  await store.dispatch(
    api.endpoints.getConfig.initiate({ variant: 'normal', language: 'en' }),
  );
}

/** Call in afterAll: drops RTK Query's cache timers so Jest can exit. */
export const cleanUpStore = () => {
  store.dispatch(api.util.resetApiState());
};
