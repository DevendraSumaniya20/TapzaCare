import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { loadSavedLanguage } from './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store';
import { loadBookings } from './src/store/bookingsSlice';
import { loadDoses } from './src/store/dosesSlice';
import { setLanguage } from './src/store/settingsSlice';

function App() {
  // Restore what was saved on earlier launches: the language (the store copy tells the mock what to serve)
  // the doses already marked as taken today, and bookings (including any still waiting to be sent).
  useEffect(() => {
    loadSavedLanguage().then(language => {
      if (language) store.dispatch(setLanguage(language));
    });
    store.dispatch(loadDoses());
    store.dispatch(loadBookings());
  }, []);

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
