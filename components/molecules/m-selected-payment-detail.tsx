import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useFallbackImages } from '@/lib/hooks/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { HostPaymentDetailsQuery } from '@/lib/services/graphql/generated';
import { Image } from 'expo-image';
import { Platform, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';

type Props = {
  details: HostPaymentDetailsQuery['hostPaymentDetails'][number];
};

const SelectedPaymentDetails: React.FC<Props> = ({ details }) => {
  const colors = useThemeColors();
  const { handleImageError } = useFallbackImages();

  return (
    <View
      className="flex-row items-center gap-4 rounded-2xl border p-4"
      style={{
        borderColor: hexToRgba(colors.primary, 0.2),
        backgroundColor: colors.background,
        ...Platform.select({
          ios: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: 8,
            shadowColor: hexToRgba(colors.primary, 0.3),
          },
        }),
      }}
    >
      <View className="h-[36px] max-w-[65px] flex-1 border">
        <Image
          source={{
            uri: details.bankDetails?.image,
          }}
          style={{
            height: '100%',
            borderRadius: 999,
          }}
          contentFit="contain"
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          onError={() => handleImageError(0)}
        />
      </View>
      <View>
        <ThemedText style={{ fontFamily: Fonts.medium }}>
          {details.accountName ?? 'Account Name'}
        </ThemedText>
        <ThemedText>
          {details.accountNumber} {details.bankDetails?.name}
        </ThemedText>
      </View>
    </View>
  );
};

export default SelectedPaymentDetails;
