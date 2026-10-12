import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import type { TabScreen } from '../types/api';
import { useConfig } from './useConfig';

/**
 * Tab route names are config ids, so code cannot navigate to "bookings" by name.
 * This finds whichever tab currently shows that screen. No such tab in the config: nothing happens.
 */
export function useGoToTab() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { config } = useConfig();

  return (screen: TabScreen) => {
    const tab = config.tabs.find(candidate => candidate.screen === screen);
    if (tab) navigation.navigate(tab.id);
  };
}
