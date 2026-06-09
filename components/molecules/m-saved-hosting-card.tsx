import { FALLBACK_IMAGE, PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { MynauiStarSolid } from '../icons/i-star';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import Skeleton from '../atoms/a-skeleton';
import { useRouter } from '@/lib/hooks/use-router';
import Checkbox from '../atoms/a-checkbox';
import { SavedHostingsQuery } from '@/lib/services/graphql/generated';
import HostingLikeButton from '../atoms/a-hosting-like-button';
import { hexToRgba } from '@/lib/utils/colors';
import { Platform } from 'react-native';

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

  return (
    <Pressable
      style={({ pressed }) => ({
        marginBottom: 8,
        gap: 8,
        opacity: pressed && !selectMode ? 0.85 : 1,
      })}
      onPress={() => {
        if (selectMode) {
          if (selected) {
            onDeSelect?.(hosting.id);
          } else {
            onSelect?.(hosting.id);
          }
        } else {
          router.push(`/hostings/${hosting.hosting.id}`);
        }
      }}
      onLongPress={() => {
        if (!selectMode) {
          onSelectMode?.();
          onSelect?.(hosting.id);
        }
      }}
    >
      <View
        style={{
          height: 140,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: selected ? 2 : 0,
          borderColor: selected ? colors.primary : 'transparent',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selected ? 0.2 : 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: selected ? 6 : 3,
            },
          }),
        }}
      >
        <Image
          source={{
            uri: hosting.hosting.coverImage?.asset.publicUrl,
          }}
          style={{ height: '100%', width: '100%' }}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: PROPERTY_BLURHASH }}
          placeholderContentFit="cover"
          cachePolicy="memory-disk"
          priority="high"
        />
        <View
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          {selectMode ? (
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: selected ? colors.primary : 'rgba(255,255,255,0.9)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: selected ? 0 : 1.5,
                borderColor: hexToRgba(colors.text, 0.15),
              }}
            >
              {selected && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#fff',
                  }}
                />
              )}
            </View>
          ) : (
            <HostingLikeButton saved={hosting.hosting.saved ?? false} id={hosting.hosting.id} />
          )}
        </View>
        {selected && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: colors.primary,
            }}
          />
        )}
      </View>
      <View style={{ paddingHorizontal: 2 }}>
        <ThemedText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontFamily: Fonts.medium, fontSize: 14 }}
        >
          {hosting.hosting.title}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <MynauiStarSolid color={colors.primary} size={13} />
          <ThemedText
            style={{
              fontFamily: Fonts.medium,
              fontSize: 13,
              color: hexToRgba(colors.text, 0.7),
            }}
          >
            {hosting.hosting.averageRating?.toFixed(1) ?? '0.0'}
            <ThemedText style={{ fontSize: 12, color: hexToRgba(colors.text, 0.4) }}>
              ({hosting.hosting.totalRatings ?? 0})
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

export default SavedHostingCard;

export const SavedHostingCardSkeleton = () => {
  const colors = useThemeColors();
  return (
    <View style={{ marginBottom: 8, gap: 8 }}>
      <View style={{ height: 140 }}>
        <Skeleton
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 16,
          }}
        />
      </View>
      <View style={{ gap: 6, paddingHorizontal: 2 }}>
        <Skeleton style={{ height: 16, width: '100%', borderRadius: 8 }} />
        <Skeleton style={{ height: 14, width: 60, borderRadius: 8 }} />
      </View>
    </View>
  );
};
