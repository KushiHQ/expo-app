import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { MynauiStarSolid } from '../icons/i-star';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import Skeleton from '../atoms/a-skeleton';
import { useRouter } from 'expo-router';
import Checkbox from '../atoms/a-checkbox';
import { useFallbackImages } from '@/lib/hooks/images';
import { SavedHostingsQuery } from '@/lib/services/graphql/generated';
import HostingLikeButton from '../atoms/a-hosting-like-button';

type Props = {
  hosting: SavedHostingsQuery['savedHostings'][number];
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDeSelect?: (id: string) => void;
  onSelectMode?: () => void;
};

const SavedHostingCard: React.FC<Props> = ({
  hosting,
  selected,
  selectMode,
  onSelect,
  onDeSelect,
  onSelectMode,
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const { handleImageError, failedImages } = useFallbackImages();

  return (
    <Pressable
      className="mb-2 gap-1"
      onPress={() => router.push(`/hostings/${hosting.hosting.id}`)}
      onLongPress={onSelectMode}
    >
      <View className="relative h-[130px]">
        <Image
          source={{
            uri: failedImages.has(0) ? FALLBACK_IMAGE : hosting.image?.asset.publicUrl,
          }}
          style={{ height: '100%', width: '100%', borderRadius: 12 }}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
          onError={() => handleImageError(0)}
        />
        <View className="absolute right-1 top-1">
          {selectMode ? (
            <Checkbox
              checked={selected}
              onValueChange={(checked) => {
                if (checked) {
                  onSelect?.(hosting.id);
                } else {
                  onDeSelect?.(hosting.id);
                }
              }}
              size={24}
              color={colors.primary}
              iconStyles={{
                position: 'absolute',
                left: -2.5,
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: 4,
                width: 18,
                height: 18,
                alignContent: 'center',
                justifyContent: 'center',
              }}
            />
          ) : (
            <HostingLikeButton saved={hosting.hosting.saved ?? false} id={hosting.hosting.id} />
          )}
        </View>
      </View>
      <View>
        <ThemedText numberOfLines={1} ellipsizeMode="tail" style={{ fontFamily: Fonts.medium }}>
          {hosting.hosting.title}
        </ThemedText>
        <View className="flex-row items-center gap-1">
          <MynauiStarSolid color={colors.accent} size={16} />
          <ThemedText>
            {hosting.hosting.averageRating?.toFixed(2) ?? '0.0'}({hosting.hosting.totalRatings ?? 0}
            )
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

export default SavedHostingCard;

export const SavedHostingCardSkeleton = () => {
  return (
    <View className="mb-2 gap-2">
      <View className="h-[130px]">
        <Skeleton style={{ height: '100%', width: '100%', borderRadius: 12 }} />
      </View>
      <View className="gap-1">
        <Skeleton style={{ height: 17, width: '100%', borderRadius: 12 }} />
        <Skeleton style={{ height: 16, width: '100%', maxWidth: 50, borderRadius: 12 }} />
      </View>
    </View>
  );
};
