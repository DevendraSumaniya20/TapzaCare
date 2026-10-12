import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { isText, parseItems } from '../../../utils/parseItems';
import { AppText } from '../../AppText';
import { SectionBackground, useSectionTextColor } from '../SectionBackground';
import type { SectionProps } from '../SectionRenderer';

/** offer_strip: a thin coloured band with one message. Thinner than other sections, so it skips SectionShell. */
export function OfferStrip({ section, topInset = 0 }: SectionProps) {
  const { spacing } = useTheme();
  const textColor = useSectionTextColor(section.background);
  const [offer] = parseItems(section.items, item =>
    isText(item.message) ? { message: item.message } : null,
  );
  if (!offer) return null;

  return (
    <View
      style={{
        paddingTop: topInset + spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
      }}
    >
      <SectionBackground background={section.background} />
      <AppText bold color={textColor} style={styles.message}>
        {offer.message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  message: { textAlign: 'center' },
});
