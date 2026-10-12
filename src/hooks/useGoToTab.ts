import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { TabScreen } from '../types/api';
import { useConfig } from './useConfig';

/**
 * Tab route names are config ids, so code cannot navigate to "bookings" by name.
 * This finds whichever tab currently shows that screen. No such tab in the config: nothing happens.
 * Works from a tab and from screens stacked above the tabs.
 */
export function useGoToTab() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { config } = useConfig();

  return (screen: TabScreen) => {
    const tab = config.tabs.find(candidate => candidate.screen === screen);
    if (tab) navigation.navigate('Tabs', { screen: tab.id });
  };
}

/** Opens the booking flow, optionally with a doctor already chosen. */
export function useOpenBooking() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (doctorId?: string) => navigation.navigate('Booking', { doctorId });
}
