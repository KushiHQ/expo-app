import { View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import React from 'react';
import { hexToRgba } from '@/lib/utils/colors';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import { capitalize } from '@/lib/utils/text';
import { Fonts } from '@/lib/constants/theme';
import Button from '../atoms/a-button';

type Props = {
  message: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
};

const EmptyList: React.FC<Props> = ({ message, buttonTitle, onButtonPress }) => {
  const colors = useThemeColors();

  return (
    <View className="items-center justify-center gap-6 p-8 py-20">
      <View
        className="rounded-3xl p-6"
        style={{ backgroundColor: hexToRgba(colors.primary, 0.05) }}
      >
        <Image
          style={{
            width: 220,
            height: 150,
            objectFit: 'contain',
          }}
          source={require('@/assets/images/empty-folder-3d.png')}
        />
      </View>
      <View className="items-center gap-2">
        <ThemedText
          style={{
            color: colors.text,
            fontFamily: Fonts.semibold,
            fontSize: 18,
            textAlign: 'center',
          }}
        >
          {capitalize(message)}
        </ThemedText>
        <ThemedText
          style={{
            color: hexToRgba(colors.text, 0.5),
            fontFamily: Fonts.medium,
            fontSize: 14,
            textAlign: 'center',
            paddingHorizontal: 20,
          }}
        >
          It looks like there's nothing here at the moment. Check back later or try refreshing.
        </ThemedText>
      </View>
      {buttonTitle && onButtonPress && (
        <Button onPress={onButtonPress} type="primary" className="mt-4 px-10 py-3.5">
          <ThemedText style={{ fontFamily: Fonts.semibold, color: '#fff' }}>
            {buttonTitle}
          </ThemedText>
        </Button>
      )}
    </View>
  );
};

export default EmptyList;
