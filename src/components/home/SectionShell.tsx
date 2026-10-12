import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { SectionConfig } from '../../types/api';
import { AppText } from '../AppText';
import { SectionBackground, useSectionTextColor } from './SectionBackground';

type Props = {
  section: SectionConfig;
  topInset?: number;
  children: ReactNode;
};

/** The band every section sits in: its own background, vertical padding and optional title. */
export function SectionShell({ section, topInset = 0, children }: Props) {
  const { spacing } = useTheme();
  const textColor = useSectionTextColor(section.background);

  return (
    <View
      style={{ paddingTop: topInset + spacing.xl, paddingBottom: spacing.xl }}
    >
      <SectionBackground background={section.background} />
      {section.title ? (
        <AppText
          variant="subtitle"
          bold
          color={textColor}
          accessibilityRole="header"
          style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}
        >
          {section.title}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}
