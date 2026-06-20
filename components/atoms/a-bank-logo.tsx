import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Image } from 'expo-image';
import { Landmark } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import ThemedText from './a-themed-text';

type Props = {
  borderColor?: string;
  contentFit?: 'cover' | 'contain';
  name?: string | null;
  rounded?: number;
  size?: number;
  uri?: string | null;
};

const BankLogo: React.FC<Props> = ({
  borderColor,
  contentFit = 'contain',
  name,
  rounded = 999,
  size = 36,
  uri,
}) => {
  const colors = useThemeColors();
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  const initial = name?.trim().charAt(0).toUpperCase();
  const showImage = !!uri && !imageFailed;

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.background,
        borderColor: borderColor ?? hexToRgba(colors.primary, 0.5),
        borderRadius: rounded,
        borderWidth: 1,
        height: size,
        justifyContent: 'center',
        overflow: 'hidden',
        width: size,
      }}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{
            borderRadius: rounded,
            height: '100%',
            width: '100%',
          }}
          contentFit={contentFit}
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          onError={() => setImageFailed(true)}
        />
      ) : initial ? (
        <ThemedText
          style={{
            color: colors.primary,
            fontFamily: Fonts.bold,
            fontSize: Math.max(12, size * 0.38),
          }}
        >
          {initial}
        </ThemedText>
      ) : (
        <Landmark size={Math.max(16, size * 0.45)} color={hexToRgba(colors.text, 0.5)} />
      )}
    </View>
  );
};

export default BankLogo;
