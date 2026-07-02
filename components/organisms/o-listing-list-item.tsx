import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { EllipsisVertical, MapPin } from 'lucide-react-native';
import { hexToRgba } from '@/lib/utils/colors';
import { IconParkOutlineDot } from '../icons/i-circle';
import ListingOptions from '../molecules/m-listing-options';
import { useRouter } from '@/lib/hooks/use-router';
import { HostingKind, HostListingsQuery, PublishStatus } from '@/lib/services/graphql/generated';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SURFACE } from '@/lib/constants/surface';

type Props = {
  hosting: HostListingsQuery['hostings'][number];
  onDelete?: () => void;
  onDuplicate?: () => void;
};

const ListingListItem: React.FC<Props> = ({ hosting, onDelete, onDuplicate }) => {
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
  // Units reuse this row but carry no city/state — hide the location line
  // rather than render an empty ", ".
  const location = hosting.state ? [hosting.city, hosting.state].filter(Boolean).join(', ') : '_';
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
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-row items-center gap-3.5 rounded-[20px] p-2.5"
        style={{ backgroundColor: hexToRgba(colors.text, 0.05), boxShadow: SURFACE.shadow } as any}
      >
        <View className="h-[88px] w-[104px] overflow-hidden rounded-2xl">
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
        </View>
        <View className="flex-1 gap-1.5">
          <View className="flex-row items-start justify-between gap-2">
            <ThemedText
              className="flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 15, fontFamily: Fonts.semibold }}
            >
              {hosting.title}
            </ThemedText>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOptionsOpen(true);
              }}
              className="rounded-full p-1"
              style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
            >
              <EllipsisVertical color={colors.text} size={16} />
            </Pressable>
          </View>
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
              {location}
            </ThemedText>
          </View>
          <View className="mt-0.5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="flex-row items-center gap-1.5 rounded-full px-2 py-0.5"
                style={{ backgroundColor: hexToRgba(statusColor, 0.16) }}
              >
                <IconParkOutlineDot color={statusColor} size={8} />
                <Text
                  style={{
                    fontSize: 11,
                    color: statusColor,
                    fontFamily: Fonts.semibold,
                    textTransform: 'capitalize',
                  }}
                >
                  {status}
                </Text>
              </View>
              {isParent ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: hexToRgba(colors.text, 0.55),
                    fontFamily: Fonts.medium,
                  }}
                >
                  {hosting.childCount} unit{hosting.childCount === 1 ? '' : 's'}
                </Text>
              ) : null}
            </View>
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

export default ListingListItem;
