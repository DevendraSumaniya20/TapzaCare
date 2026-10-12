import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { MIN_TAP_TARGET } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { api } from '../services/api';
import { getServedConfig, setConfigOverride } from '../services/mockServer';
import { useAppDispatch, useAppSelector } from '../store';
import type { SectionConfig, ThemeColors } from '../types/api';
import { withAlpha } from '../utils/color';
import { haptics } from '../utils/haptics';

// The colours worth changing for a festival. The rest of the palette is kept as is.
const EDITABLE_COLORS: (keyof ThemeColors)[] = [
  'primary',
  'accent',
  'background',
];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * A small admin tool: change a few theme colours and the order of the home sections, then publish.
 * Publishing writes to the mock server and refetches /config, exactly as a remote change would arrive.
 * It edits the light palette of whichever day (normal or festival) is currently selected.
 */
export function ConfigAdminScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius, fontSize } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const variant = useAppSelector(state => state.settings.variant);

  const [base, setBase] = useState(() => getServedConfig(variant));
  const [palette, setPalette] = useState<ThemeColors>(base.theme);
  const [sections, setSections] = useState<SectionConfig[]>(base.sections);
  const [message, setMessage] = useState<string>();

  const invalid = EDITABLE_COLORS.filter(key => !HEX_COLOR.test(palette[key]));

  const publish = (config: typeof base | null) => {
    setConfigOverride(variant, config);
    dispatch(api.util.invalidateTags(['Config']));
    haptics.success();
  };

  const apply = () => {
    const next = {
      ...base,
      version: base.version + 1,
      theme: { ...base.theme, ...palette },
      sections,
    };
    publish(next);
    setBase(next);
    setMessage(t('admin.applied', { version: next.version }));
  };

  const reset = () => {
    publish(null);
    const shipped = getServedConfig(variant);
    setBase(shipped);
    setPalette(shipped.theme);
    setSections(shipped.sections);
    setMessage(undefined);
  };

  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    haptics.select();
  };

  const border = withAlpha(colors.textSecondary, 0.25);
  const iconButton = (
    Icon: LucideIcon,
    label: string,
    onPress: () => void,
    disabled = false,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.iconButton, disabled ? styles.disabled : null]}
    >
      <Icon color={colors.primary} size={spacing.xl} />
    </Pressable>
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: spacing.lg,
        paddingBottom: insets.bottom + spacing.xl,
        gap: spacing.lg,
      }}
    >
      <AppText color={colors.textSecondary}>
        {t('admin.editing', {
          day: t(
            variant === 'festival'
              ? 'profile.festivalDay'
              : 'profile.normalDay',
          ),
        })}
      </AppText>

      <AppText variant="subtitle" bold accessibilityRole="header">
        {t('admin.colours')}
      </AppText>
      {EDITABLE_COLORS.map(key => (
        <View key={key} style={[styles.row, { gap: spacing.md }]}>
          {/* Live swatch, so a typed colour can be judged before publishing. */}
          <View
            style={[
              styles.swatch,
              {
                borderRadius: radius.sm,
                borderColor: border,
                backgroundColor: HEX_COLOR.test(palette[key])
                  ? palette[key]
                  : colors.surface,
              },
            ]}
          />
          <AppText style={styles.flex}>{key}</AppText>
          <TextInput
            accessibilityLabel={key}
            value={palette[key]}
            onChangeText={text =>
              setPalette({ ...palette, [key]: text.trim() })
            }
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            style={[
              styles.input,
              {
                paddingHorizontal: spacing.md,
                borderRadius: radius.sm,
                borderColor: invalid.includes(key) ? colors.accent : border,
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                fontSize: fontSize.body,
              },
            ]}
          />
        </View>
      ))}
      {invalid.length > 0 ? (
        <AppText
          variant="caption"
          color={colors.accent}
          accessibilityLiveRegion="polite"
        >
          {t('admin.invalidColor')}
        </AppText>
      ) : null}

      <AppText variant="subtitle" bold accessibilityRole="header">
        {t('admin.sections')}
      </AppText>
      {sections.map((section, index) => (
        <View
          key={section.id}
          style={[
            styles.row,
            styles.card,
            {
              padding: spacing.sm,
              paddingLeft: spacing.lg,
              borderRadius: radius.md,
              borderColor: border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <View style={styles.flex}>
            <AppText bold>{section.type}</AppText>
            {section.title ? (
              <AppText
                variant="caption"
                color={colors.textSecondary}
                numberOfLines={1}
              >
                {section.title}
              </AppText>
            ) : null}
          </View>
          {iconButton(
            ArrowUp,
            `${t('admin.moveUp')} ${section.type}`,
            () => move(index, -1),
            index === 0,
          )}
          {iconButton(
            ArrowDown,
            `${t('admin.moveDown')} ${section.type}`,
            () => move(index, 1),
            index === sections.length - 1,
          )}
          {iconButton(Trash2, `${t('admin.remove')} ${section.type}`, () =>
            setSections(
              sections.filter(candidate => candidate.id !== section.id),
            ),
          )}
        </View>
      ))}

      {message ? (
        <AppText bold color={colors.primary} accessibilityLiveRegion="polite">
          {message}
        </AppText>
      ) : null}
      <PrimaryButton
        label={t('admin.apply')}
        disabled={invalid.length > 0}
        onPress={apply}
      />
      <Pressable
        accessibilityRole="button"
        onPress={reset}
        style={styles.reset}
      >
        <AppText bold color={colors.primary}>
          {t('admin.reset')}
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  card: { borderWidth: StyleSheet.hairlineWidth },
  swatch: { width: MIN_TAP_TARGET, height: MIN_TAP_TARGET, borderWidth: 1 },
  input: { width: 130, minHeight: MIN_TAP_TARGET, borderWidth: 1 },
  iconButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.3 },
  reset: {
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
