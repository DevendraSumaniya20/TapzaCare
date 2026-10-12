import { StyleSheet, View } from 'react-native';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { StateView } from './StateView';

/**
 * Covers the app while the device has no connection and removes itself when it returns.
 * Drawn over the navigator rather than replacing it, so the screen the user was on,
 * its scroll position and any half-finished booking are still there afterwards.
 */
export function OfflineScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isConnected } = useNetInfo();

  // null means "not known yet" (first moments after launch): do not flash the screen for that.
  if (isConnected !== false) return null;

  return (
    <View
      accessibilityViewIsModal
      accessibilityLiveRegion="assertive"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
    >
      <StateView
        icon={WifiOff}
        title={t('offline.title')}
        message={t('offline.message')}
        actionLabel={t('common.retry')}
        // Asks the OS again right now instead of waiting for its next connectivity event.
        onAction={() => NetInfo.refresh()}
      />
    </View>
  );
}
