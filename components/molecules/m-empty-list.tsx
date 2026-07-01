import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import React from 'react';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import { capitalize } from '@/lib/utils/text';
import { Fonts } from '@/lib/constants/theme';
import { SURFACE } from '@/lib/constants/surface';
import Button from '../atoms/a-button';

type Props = {
  message: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
};

const EmptyList: React.FC<Props> = ({ message, buttonTitle, onButtonPress }) => {
  const colors = useThemeColors();

  return (
    <View className="items-center justify-center gap-6 p-8 py-16">
      <View
        className="rounded-full p-7"
        style={{
          backgroundColor: hexToRgba(colors.primary, 0.07),
          boxShadow: SURFACE.glow,
        }}
      >
        <Image
          style={{
            width: 190,
            height: 140,
            objectFit: 'contain',
          }}
          source={require('@/assets/images/empty-folder-3d.png')}
        />
      </View>
      <View className="items-center gap-2">
        <ThemedText
          style={{
            color: colors.text,
            fontFamily: Fonts.bold,
            fontSize: 18,
            letterSpacing: -0.3,
            textAlign: 'center',
          }}
        >
          {capitalize(message)}
        </ThemedText>
        <ThemedText
          style={{
            color: hexToRgba(colors.text, 0.5),
            fontFamily: Fonts.medium,
            fontSize: 13.5,
            textAlign: 'center',
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          It looks like there’s nothing here at the moment. Check back later or try refreshing.
        </ThemedText>
      </View>
      {buttonTitle && onButtonPress && (
        <Button onPress={onButtonPress} type="primary" className="mt-2 px-8">
          <ThemedText content="primary">{buttonTitle}</ThemedText>
        </Button>
      )}
    </View>
  );
};

export default EmptyList;
