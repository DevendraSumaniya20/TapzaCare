import { trigger } from 'react-native-haptic-feedback';

// Named by intent so call sites do not pick raw patterns. The OS setting can still silence them.
export const haptics = {
  /** Choosing between options: chips, tabs, slots. */
  select: () => trigger('selection'),
  /** Pressing something that starts an action. */
  tap: () => trigger('impactLight'),
  success: () => trigger('notificationSuccess'),
  error: () => trigger('notificationError'),
};
