import { StyleSheet, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { AppText } from './AppText';

/**
 * A strip that sits on top of the tab bar while the device is offline and disappears when it reconnects.
 * It informs without blocking: saved content stays readable and every tab stays reachable.
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { isConnected } = useNetInfo();

  // null means "not known yet" (first moments after launch): do not flash the banner for that.
  if (isConnected !== false) return null;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          backgroundColor: colors.textPrimary,
        },
      ]}
    >
      <WifiOff color={colors.surface} size={spacing.lg} />
      <AppText variant="caption" color={colors.surface} style={styles.text}>
        {t('offline.banner')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
});
