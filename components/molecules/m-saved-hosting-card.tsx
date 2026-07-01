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
import { SavedHostingsQuery } from '@/lib/services/graphql/generated';
import HostingLikeButton from '../atoms/a-hosting-like-button';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  hosting: SavedHostingsQuery['savedHostings'][number];
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDeSelect?: (id: string) => void;
  onSelectMode?: () => void;
  onUpdate?: () => void;
};

const SavedHostingCard: React.FC<Props> = ({
  hosting,
  selected,
  selectMode,
  onSelect,
  onDeSelect,
  onSelectMode,
  onUpdate,
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
          height: 150,
          borderRadius: 22,
          overflow: 'hidden',
          backgroundColor: selected
            ? hexToRgba(colors.primary, SURFACE.fillSelected)
            : hexToRgba(colors.text, 0.05),
          boxShadow: selected ? SURFACE.glow : SURFACE.shadow,
          padding: selected ? 3 : 0,
        }}
      >
        <View style={{ flex: 1, borderRadius: selected ? 19 : 22, overflow: 'hidden' }}>
          <Image
            source={{
              // Fall back through: hosting cover → the saved record's own image →
              // a static placeholder, so the tile never renders a broken image
              // (e.g. a listing saved before it had a cover photo).
              uri:
                hosting.hosting.coverImage?.asset.publicUrl ??
                hosting.image?.asset.publicUrl ??
                FALLBACK_IMAGE,
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
              right: 10,
              top: 10,
            }}
          >
            {selectMode ? (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: selected ? colors.primary : hexToRgba('#000000', 0.5),
                  alignItems: 'center',
                  justifyContent: 'center',
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
              <HostingLikeButton
                saved={hosting.hosting.saved ?? false}
                id={hosting.hosting.id}
                onUpdate={() => onUpdate?.()}
              />
            )}
          </View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 2 }}>
        <ThemedText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontFamily: Fonts.semibold, fontSize: 15 }}
        >
          {hosting.hosting.title}
        </ThemedText>
        <View
          className="mt-1 flex-row items-center gap-1 self-start rounded-full px-2.5 py-1"
          style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
        >
          <MynauiStarSolid color={colors.primary} size={12} />
          <ThemedText
            style={{
              fontFamily: Fonts.semibold,
              fontSize: 12,
              color: colors.text,
            }}
          >
            {hosting.hosting.averageRating?.toFixed(1) ?? '0.0'}
          </ThemedText>
          <ThemedText
            style={{
              fontFamily: Fonts.regular,
              fontSize: 11,
              color: hexToRgba(colors.text, 0.45),
            }}
          >
            ({hosting.hosting.totalRatings ?? 0})
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

export default SavedHostingCard;

export const SavedHostingCardSkeleton = () => {
  return (
    <View style={{ marginBottom: 8, gap: 8 }}>
      <View style={{ height: 150 }}>
        <Skeleton
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 22,
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
