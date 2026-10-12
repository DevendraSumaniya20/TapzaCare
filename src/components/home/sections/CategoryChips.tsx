import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import { getIcon } from '../../../constants/icons';
import { MIN_TAP_TARGET } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { withAlpha } from '../../../utils/color';
import { haptics } from '../../../utils/haptics';
import { isText, parseItems } from '../../../utils/parseItems';
import { AppText } from '../../AppText';
import { useSectionTextColor } from '../SectionBackground';
import type { SectionProps } from '../SectionRenderer';
import { SectionShell } from '../SectionShell';

const CHIP_WIDTH = scale(76);
const ICON_BOX = scale(52);

/** category_chips: horizontally scrolling categories, icon above label, the chosen one underlined. */
export function CategoryChips({ section, topInset }: SectionProps) {
  const { colors, spacing, radius } = useTheme();
  const textColor = useSectionTextColor(section.background);
  const chips = parseItems(section.items, item =>
    isText(item.id) && isText(item.label)
      ? {
          id: item.id,
          label: item.label,
          icon: isText(item.icon) ? item.icon : '',
        }
      : null,
  );
  const [selectedId, setSelectedId] = useState(chips[0]?.id);
  if (chips.length === 0) return null;

  return (
    <SectionShell section={section} topInset={topInset}>
      <FlatList
        horizontal
        data={chips}
        keyExtractor={chip => chip.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
        }}
        renderItem={({ item }) => {
          const Icon = getIcon(item.icon);
          const selected = item.id === selectedId;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => {
                haptics.select();
                setSelectedId(item.id);
              }}
              style={[styles.chip, { gap: spacing.xs }]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    borderRadius: radius.md,
                    backgroundColor: selected
                      ? colors.primary
                      : withAlpha(colors.primary, 0.1),
                  },
                ]}
              >
                <Icon
                  color={selected ? colors.surface : colors.primary}
                  size={ICON_BOX * 0.46}
                />
              </View>
              <AppText
                variant="caption"
                bold={selected}
                color={textColor}
                numberOfLines={2}
                style={styles.label}
              >
                {item.label}
              </AppText>
              <View
                style={[
                  styles.underline,
                  {
                    borderRadius: radius.pill,
                    backgroundColor: colors.primary,
                  },
                  selected ? null : styles.hidden,
                ]}
              />
            </Pressable>
          );
        }}
      />
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  chip: { width: CHIP_WIDTH, minHeight: MIN_TAP_TARGET, alignItems: 'center' },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center', flexGrow: 1 },
  underline: { height: 3, alignSelf: 'stretch' },
  hidden: { opacity: 0 },
});
