import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { OptionGroup } from '../components/OptionGroup';
import { useConfig } from '../hooks/useConfig';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES, saveLanguage, type Language } from '../i18n';
import type { ConfigVariant, FailureMode } from '../services/mockServer';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setFailure,
  setLanguage,
  setLatency,
  setVariant,
} from '../store/settingsSlice';

const SOURCE_KEY = {
  network: 'profile.sourceNetwork',
  cache: 'profile.sourceCache',
  bundled: 'profile.sourceBundled',
} as const;

/** Profile tab: language, plus the mock-backend switches the brief asks for. */
export function ProfileScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const { config, source } = useConfig();

  const variants: { value: ConfigVariant; label: string }[] = [
    { value: 'normal', label: t('profile.normalDay') },
    { value: 'festival', label: t('profile.festivalDay') },
  ];
  const latencies = [
    { value: 0, label: t('profile.instant') },
    { value: 600, label: t('profile.normal') },
    { value: 3000, label: t('profile.slow') },
  ];
  const failures: { value: FailureMode; label: string }[] = [
    { value: 'none', label: t('profile.failNone') },
    { value: 'config', label: t('profile.failConfig') },
    { value: 'bookings', label: t('profile.failBookings') },
    { value: 'all', label: t('profile.failAll') },
  ];

  const changeLanguage = (language: Language) => {
    dispatch(setLanguage(language));
    saveLanguage(language);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: spacing.lg,
        paddingTop: insets.top + spacing.lg,
        gap: spacing.xl,
      }}
    >
      <AppText
        variant="title"
        bold
        accessibilityRole="header"
        style={styles.title}
      >
        {t('profile.title')}
      </AppText>
      <OptionGroup
        label={t('profile.language')}
        options={LANGUAGES}
        selected={settings.language}
        onSelect={changeLanguage}
      />
      <AppText color={colors.textSecondary}>
        {t('profile.demoControls')}
        {' · '}
        {t('profile.configVersion', { version: config.version })}
        {source ? ` · ${t(SOURCE_KEY[source])}` : ''}
      </AppText>
      <OptionGroup
        label={t('profile.homeLayout')}
        options={variants}
        selected={settings.variant}
        onSelect={value => dispatch(setVariant(value))}
      />
      <OptionGroup
        label={t('profile.networkSpeed')}
        options={latencies}
        selected={settings.latencyMs}
        onSelect={value => dispatch(setLatency(value))}
      />
      <OptionGroup
        label={t('profile.failRequests')}
        options={failures}
        selected={settings.failure}
        onSelect={value => dispatch(setFailure(value))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center' },
});
