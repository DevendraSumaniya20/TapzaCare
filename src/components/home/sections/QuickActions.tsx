import { Pressable, StyleSheet, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import { getIcon } from '../../../constants/icons';
import { useGoToTab } from '../../../hooks/useGoToTab';
import { useTheme } from '../../../hooks/useTheme';
import type { TabScreen } from '../../../types/api';
import { withAlpha } from '../../../utils/color';
import { haptics } from '../../../utils/haptics';
import { isText, parseItems } from '../../../utils/parseItems';
import { AppText } from '../../AppText';
import { useSectionTextColor } from '../SectionBackground';
import type { SectionProps } from '../SectionRenderer';
import { SectionShell } from '../SectionShell';

// Where each action leads today. Reminders and Family have no screen of their own yet.
const TARGET_SCREEN: Record<string, TabScreen> = {
  book: 'bookings',
  prescriptions: 'prescriptions',
  reminders: 'prescriptions',
  family: 'profile',
};

const ICON_BOX = scale(56);

/** quick_actions: a row of icon tiles for the things patients do most. */
export function QuickActions({ section, topInset }: SectionProps) {
  const { colors, spacing, radius } = useTheme();
  const textColor = useSectionTextColor(section.background);
  const goToTab = useGoToTab();
  const actions = parseItems(section.items, item =>
    isText(item.id) && isText(item.label)
      ? {
          id: item.id,
          label: item.label,
          icon: isText(item.icon) ? item.icon : '',
          target: isText(item.target) ? item.target : '',
        }
      : null,
  );
  if (actions.length === 0) return null;

  return (
    <SectionShell section={section} topInset={topInset}>
      <View
        style={[styles.row, { paddingHorizontal: spacing.lg, gap: spacing.sm }]}
      >
        {actions.map(action => {
          const Icon = getIcon(action.icon);
          const screen = TARGET_SCREEN[action.target];
          return (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => {
                haptics.tap();
                if (screen) goToTab(screen);
              }}
              style={({ pressed }) => [
                styles.tile,
                { gap: spacing.xs, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    borderRadius: radius.md,
                    backgroundColor: colors.surface,
                    // Keeps the tile visible when the section background is also the surface colour.
                    borderColor: withAlpha(colors.textSecondary, 0.2),
                  },
                ]}
              >
                <Icon color={colors.primary} size={ICON_BOX * 0.46} />
              </View>
              <AppText
                variant="caption"
                color={textColor}
                numberOfLines={2}
                style={styles.label}
              >
                {action.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  tile: { flex: 1, alignItems: 'center' },
  iconBox: {
    borderWidth: StyleSheet.hairlineWidth,
    width: ICON_BOX,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
