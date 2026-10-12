import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { OptionGroup } from '../components/OptionGroup';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../hooks/useTheme';
import type { ConfigVariant, FailureMode } from '../services/mockServer';
import { useAppDispatch, useAppSelector } from '../store';
import { setFailure, setLatency, setVariant } from '../store/settingsSlice';

const VARIANTS: { value: ConfigVariant; label: string }[] = [
  { value: 'normal', label: 'Normal day' },
  { value: 'festival', label: 'Festival day' },
];
const LATENCIES = [
  { value: 0, label: 'Instant' },
  { value: 600, label: 'Normal' },
  { value: 3000, label: 'Slow (3s)' },
];
const FAILURES: { value: FailureMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'config', label: 'Config' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'all', label: 'Everything' },
];

const SOURCE_LABEL = {
  network: 'Fresh from server',
  cache: 'Saved copy (server unreachable)',
  bundled: 'Built-in default (server unreachable, nothing saved)',
};

/** Profile tab. For now it holds the mock-backend switches the brief asks for. */
export function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const { config, source } = useConfig();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        gap: spacing.xl,
      }}
    >
      <AppText variant="title" bold>
        Profile
      </AppText>
      <AppText color={colors.textSecondary}>
        Demo controls for the mock server. Config version {config.version}
        {source ? ` · ${SOURCE_LABEL[source]}` : ''}
      </AppText>
      <OptionGroup
        label="Home layout"
        options={VARIANTS}
        selected={settings.variant}
        onSelect={value => dispatch(setVariant(value))}
      />
      <OptionGroup
        label="Network speed"
        options={LATENCIES}
        selected={settings.latencyMs}
        onSelect={value => dispatch(setLatency(value))}
      />
      <OptionGroup
        label="Fail requests"
        options={FAILURES}
        selected={settings.failure}
        onSelect={value => dispatch(setFailure(value))}
      />
    </ScrollView>
  );
}
