import { createContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

/** The home list's scroll offset, for sections that react to scrolling (hero parallax). */
export const HomeScrollContext = createContext<SharedValue<number> | null>(
  null,
);
