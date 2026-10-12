import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { fontSize } from '../constants/theme';

type Props = TextProps & {
  variant?: keyof typeof fontSize;
  // Any colour passed in must itself come from the theme or the config.
  color?: string;
  bold?: boolean;
};

/** The only Text the app uses: themed colour and size, OS font scaling left on. */
export function AppText({
  variant = 'body',
  color,
  bold,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          color: color ?? theme.colors.textPrimary,
          fontSize: theme.fontSize[variant],
          // Room for Telugu and Devanagari glyphs, which sit taller than Latin.
          lineHeight: theme.fontSize[variant] * 1.4,
        },
        bold ? styles.bold : styles.regular,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  regular: { fontWeight: '400' },
  bold: { fontWeight: '700' },
});
