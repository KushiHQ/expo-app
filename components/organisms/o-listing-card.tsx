import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import ListingOptions from '../molecules/m-listing-options';
import React from 'react';
import { useRouter } from '@/lib/hooks/use-router';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import ThemedText from '../atoms/a-themed-text';
import { EllipsisVertical, MapPin } from 'lucide-react-native';
import ImageScrim from '../atoms/a-image-scrim';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Fonts } from '@/lib/constants/theme';
import { hexToRgba } from '@/lib/utils/colors';
import { joinLocation } from '@/lib/utils/locations';
import { IconParkOutlineDot } from '../icons/i-circle';
import { HostingKind, HostListingsQuery, PublishStatus } from '@/lib/services/graphql/generated';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  hosting: HostListingsQuery['hostings'][number];
  onDelete?: () => void;
  onDuplicate?: () => void;
};

const ListingCard: React.FC<Props> = ({ hosting, onDelete, onDuplicate }) => {
  const router = useRouter();
  const colors = useThemeColors();
  const [optionsOpen, setOptionsOpen] = React.useState(false);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10, stiffness: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isParent = hosting.kind === HostingKind.Parent;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/hostings/form/onboarding?id=${hosting.id}`);
  };

  // Fall back to Draft when a listing has no publish status (otherwise the
  // pill renders as an empty red dot).
  const status = hosting.publishStatus || PublishStatus.Draft;
  const statusColor =
    status === PublishStatus.Live
      ? colors.success
      : status === PublishStatus.Draft
        ? colors.primary
        : status === PublishStatus.Inreview
          ? colors.secondary
          : colors.error;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View
          className="overflow-hidden rounded-3xl"
          style={
            { backgroundColor: hexToRgba(colors.text, 0.05), boxShadow: SURFACE.shadow } as any
          }
        >
          <View className="relative aspect-[3/2] w-full">
            <Image
              source={{
                uri: hosting.coverImage?.asset.publicUrl,
              }}
              style={{
                height: '100%',
                width: '100%',
              }}
              contentFit="cover"
              transition={400}
              placeholder={{ blurhash: PROPERTY_BLURHASH }}
              placeholderContentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
            />
            <ImageScrim from="top" intensity={0.45} height="42%" />
            <View
              className="absolute left-3 top-3 flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: hexToRgba('#000000', 0.5) }}
            >
              <IconParkOutlineDot color={statusColor} size={9} />
              <Text
                style={{
                  fontSize: 11,
                  color: '#fff',
                  fontFamily: Fonts.semibold,
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOptionsOpen(true);
              }}
              className="absolute right-3 top-3 rounded-full p-1.5"
              style={{ backgroundColor: hexToRgba('#000000', 0.5) }}
            >
              <EllipsisVertical color="#fff" size={18} />
            </Pressable>
          </View>
          <View className="gap-2 p-3.5">
            <View className="gap-1">
              <ThemedText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ fontSize: 15, fontFamily: Fonts.semibold }}
              >
                {hosting.title}
              </ThemedText>
              <View className="flex-row items-center gap-1.5">
                <MapPin size={12} color={hexToRgba(colors.text, 0.45)} />
                <ThemedText
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="flex-1"
                  style={{
                    fontSize: 13,
                    color: hexToRgba(colors.text, 0.6),
                    fontFamily: Fonts.medium,
                  }}
                >
                  {joinLocation(hosting.city, hosting.state)}
                </ThemedText>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              {isParent ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: hexToRgba(colors.text, 0.55),
                    fontFamily: Fonts.medium,
                  }}
                >
                  {hosting.childCount} unit{hosting.childCount === 1 ? '' : 's'}
                </Text>
              ) : (
                <View />
              )}
              <ThemedText
                style={{
                  fontSize: 12,
                  color: colors.primary,
                  fontFamily: Fonts.semibold,
                }}
              >
                Manage
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
      <ListingOptions
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        hosting={hosting}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </Animated.View>
  );
};

export default ListingCard;
