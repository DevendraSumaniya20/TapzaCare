import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { OfflineScreen } from './src/components/OfflineScreen';
import { loadSavedLanguage } from './src/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store';
import { setLanguage } from './src/store/settingsSlice';

function App() {
  // Restore the language picked on a previous launch; the store copy tells the mock what to serve.
  useEffect(() => {
    loadSavedLanguage().then(language => {
      if (language) store.dispatch(setLanguage(language));
    });
  }, []);

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
          <OfflineScreen />
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
