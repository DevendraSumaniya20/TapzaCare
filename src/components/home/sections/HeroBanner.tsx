import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import { useConfig } from '../../../hooks/useConfig';
import { useTheme } from '../../../hooks/useTheme';
import { isText, parseItems } from '../../../utils/parseItems';
import { AppText } from '../../AppText';
import { HomeScrollContext } from '../HomeScrollContext';
import { SectionBackground, useSectionTextColor } from '../SectionBackground';
import type { SectionProps } from '../SectionRenderer';

const MIN_HEIGHT = scale(190);

/**
 * hero_banner: greeting over a full-width background.
 * On scroll the background moves at 40% speed and the text fades, which gives the parallax.
 * On a festival day the festival name from the theme becomes the headline.
 */
export function HeroBanner({ section, topInset = 0 }: SectionProps) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { config } = useConfig();
  const textColor = useSectionTextColor(section.background);
  const fallbackScroll = useSharedValue(0);
  const scrollY = useContext(HomeScrollContext) ?? fallbackScroll;

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(scrollY.value, 0) * 0.4 }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, MIN_HEIGHT], [1, 0], 'clamp'),
    transform: [{ translateY: Math.max(scrollY.value, 0) * 0.2 }],
  }));

  const [hero] = parseItems(section.items, item =>
    isText(item.greeting)
      ? {
          greeting: item.greeting,
          subtitle: isText(item.subtitle) ? item.subtitle : undefined,
        }
      : null,
  );
  if (!hero) return null;

  const festival = config.theme.festival;

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <SectionBackground background={section.background} />
      </Animated.View>
      <Animated.View
        style={[
          styles.content,
          textStyle,
          {
            padding: spacing.lg,
            paddingTop: topInset + spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.xs,
          },
          festival ? styles.centered : null,
        ]}
      >
        {festival ? (
          <>
            <AppText variant="caption" color={textColor}>
              {t('home.celebrate')}
            </AppText>
            <AppText variant="display" bold color={textColor}>
              {festival.name}
            </AppText>
          </>
        ) : null}
        <AppText
          variant={festival ? 'subtitle' : 'title'}
          bold
          color={textColor}
          style={festival ? styles.centerText : null}
        >
          {hero.greeting}
        </AppText>
        {hero.subtitle ? (
          <AppText
            color={textColor}
            style={festival ? styles.centerText : null}
          >
            {hero.subtitle}
          </AppText>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: MIN_HEIGHT, overflow: 'hidden' },
  content: { flex: 1, justifyContent: 'flex-end' },
  centered: { alignItems: 'center' },
  centerText: { textAlign: 'center' },
});
