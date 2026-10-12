import { Image, type ImageProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { withAlpha } from '../utils/color';

type Props = Omit<ImageProps, 'source'> & { uri: string };

/** Network image on a tinted block, so a slow or failed load leaves a calm placeholder, not a hole. */
export function RemoteImage({ uri, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <Image
      {...rest}
      source={{ uri }}
      style={[
        { backgroundColor: withAlpha(colors.textSecondary, 0.12) },
        style,
      ]}
    />
  );
}
