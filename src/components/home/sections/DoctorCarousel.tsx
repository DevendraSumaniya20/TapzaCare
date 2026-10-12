import { useRef, type ComponentRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { scale } from 'react-native-size-matters';
import { useOpenBooking } from '../../../hooks/useGoToTab';
import { useTheme } from '../../../hooks/useTheme';
import { useGetDoctorsQuery } from '../../../services/api';
import { withAlpha } from '../../../utils/color';
import { haptics } from '../../../utils/haptics';
import { isText, parseItems } from '../../../utils/parseItems';
import { AppText } from '../../AppText';
import { RemoteImage } from '../../RemoteImage';
import type { SectionProps } from '../SectionRenderer';
import { SectionShell } from '../SectionShell';

const CARD_WIDTH = scale(156);
const PHOTO = scale(64);

/** doctor_carousel: horizontally scrolling doctor cards with photo, specialty and next free slot. */
export function DoctorCarousel({ section, topInset }: SectionProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const openBooking = useOpenBooking();
  // Warms the /doctors cache while the user is still on Home, so the booking screen opens with its
  // photos in place and the tapped photo has somewhere to fly to.
  useGetDoctorsQuery();
  const photos = useRef<Record<string, ComponentRef<typeof View> | null>>({});
  const doctors = parseItems(section.items, item =>
    isText(item.id) && isText(item.name) && isText(item.specialty)
      ? {
          id: item.id,
          name: item.name,
          specialty: item.specialty,
          photoUrl: isText(item.photoUrl) ? item.photoUrl : '',
          nextAvailable: isText(item.nextAvailable)
            ? item.nextAvailable
            : undefined,
        }
      : null,
  );
  if (doctors.length === 0) return null;

  return (
    <SectionShell section={section} topInset={topInset}>
      <FlatList
        horizontal
        data={doctors}
        keyExtractor={doctor => doctor.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.specialty}`}
            onPress={() => {
              haptics.tap();
              const photo = photos.current[item.id];
              if (!photo) return openBooking(item.id);
              photo.measureInWindow((x, y, width, height) =>
                openBooking(item.id, { x, y, width, height }),
              );
            }}
            style={({ pressed }) => [
              styles.card,
              {
                padding: spacing.md,
                gap: spacing.xs,
                borderRadius: radius.md,
                borderColor: withAlpha(colors.textSecondary, 0.2),
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            {/* Measured through a wrapper View: Image has no measure methods. collapsable keeps the View on Android. */}
            <View
              collapsable={false}
              style={styles.photoBox}
              ref={view => {
                photos.current[item.id] = view;
              }}
            >
              <RemoteImage
                uri={item.photoUrl}
                style={[styles.photo, { borderRadius: radius.pill }]}
              />
            </View>
            <AppText bold numberOfLines={2}>
              {item.name}
            </AppText>
            <AppText
              variant="caption"
              color={colors.textSecondary}
              numberOfLines={1}
            >
              {item.specialty}
            </AppText>
            {item.nextAvailable ? (
              <View
                style={[
                  styles.slot,
                  {
                    marginTop: spacing.xs,
                    padding: spacing.sm,
                    borderRadius: radius.sm,
                    backgroundColor: withAlpha(colors.primary, 0.1),
                  },
                ]}
              >
                <AppText variant="caption" color={colors.textSecondary}>
                  {t('home.nextAvailable')}
                </AppText>
                <AppText variant="caption" bold color={colors.primary}>
                  {item.nextAvailable}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, borderWidth: StyleSheet.hairlineWidth },
  // Hugs the photo, so measuring this View gives the photo's own position and size.
  photoBox: { alignSelf: 'flex-start' },
  photo: { width: PHOTO, height: PHOTO },
  slot: { alignSelf: 'stretch' },
});
