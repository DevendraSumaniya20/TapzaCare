import { Pressable, StyleSheet, View } from 'react-native';
import { useOpenBooking } from '../../../hooks/useGoToTab';
import { useTheme } from '../../../hooks/useTheme';
import { formatInr } from '../../../utils/format';
import { haptics } from '../../../utils/haptics';
import { isText, parseItems } from '../../../utils/parseItems';
import { AppText } from '../../AppText';
import { RemoteImage } from '../../RemoteImage';
import type { SectionProps } from '../SectionRenderer';
import { SectionShell } from '../SectionShell';

/** service_grid: two-column cards with image, name, price in rupees and an optional badge. */
export function ServiceGrid({ section, topInset }: SectionProps) {
  const { colors, spacing, radius } = useTheme();
  const openBooking = useOpenBooking();
  const services = parseItems(section.items, item =>
    isText(item.id) && isText(item.name) && typeof item.priceInr === 'number'
      ? {
          id: item.id,
          name: item.name,
          priceInr: item.priceInr,
          imageUrl: isText(item.imageUrl) ? item.imageUrl : '',
          badge: isText(item.badge) ? item.badge : undefined,
        }
      : null,
  );
  if (services.length === 0) return null;

  return (
    <SectionShell section={section} topInset={topInset}>
      <View
        style={[
          styles.grid,
          { paddingHorizontal: spacing.lg, rowGap: spacing.md },
        ]}
      >
        {services.map(service => (
          <Pressable
            key={service.id}
            accessibilityRole="button"
            accessibilityLabel={`${service.name}, ${formatInr(
              service.priceInr,
            )}`}
            onPress={() => {
              haptics.tap();
              openBooking();
            }}
            style={({ pressed }) => [
              styles.card,
              {
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <RemoteImage
              uri={service.imageUrl}
              style={styles.image}
              resizeMode="cover"
            />
            {service.badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.accent,
                    borderBottomRightRadius: radius.sm,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs / 2,
                  },
                ]}
              >
                <AppText variant="caption" bold color={colors.surface}>
                  {service.badge}
                </AppText>
              </View>
            ) : null}
            <View style={{ padding: spacing.md, gap: spacing.xs }}>
              <AppText numberOfLines={2}>{service.name}</AppText>
              <AppText variant="subtitle" bold color={colors.primary}>
                {formatInr(service.priceInr)}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Fixed at just under half so an odd last card keeps its size instead of stretching.
  card: { width: '48%', overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 4 / 3 },
  badge: { position: 'absolute', top: 0, left: 0 },
});
