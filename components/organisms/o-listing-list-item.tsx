import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { EllipsisVertical } from 'lucide-react-native';
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
};

const ListingListItem: React.FC<Props> = ({ hosting, onDelete }) => {
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

  const statusColor =
    hosting.publishStatus === PublishStatus.Live
      ? colors.success
      : hosting.publishStatus === PublishStatus.Draft
        ? colors.primary
        : hosting.publishStatus === PublishStatus.Inreview
          ? colors.secondary
          : colors.error;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-row items-center gap-4 rounded-2xl p-3"
        style={{ backgroundColor: hexToRgba(colors.text, 0.05), boxShadow: SURFACE.shadow } as any}
      >
        <View className="h-[80px] w-[100px] overflow-hidden rounded-xl">
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
        <View className="flex-1 gap-1">
          <View className="flex-row items-start justify-between">
            <ThemedText
              className="flex-1"
              numberOfLines={2}
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
              className="rounded-lg p-1"
              style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
            >
              <EllipsisVertical color={colors.text} size={16} />
            </Pressable>
          </View>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 13,
              color: hexToRgba(colors.text, 0.6),
              fontFamily: Fonts.medium,
            }}
          >
            {hosting.city}, {hosting.state}
          </ThemedText>
          <View className="mt-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="flex-row items-center gap-1.5">
                <IconParkOutlineDot color={statusColor} size={10} />
                <Text
                  style={{
                    fontSize: 11,
                    color: statusColor,
                    fontFamily: Fonts.semibold,
                    textTransform: 'capitalize',
                  }}
                >
                  {hosting.publishStatus}
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
                  · {hosting.childCount} unit{hosting.childCount === 1 ? '' : 's'}
                </Text>
              ) : null}
            </View>
            <ThemedText
              style={{
                fontSize: 11,
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
      />
    </Animated.View>
  );
};

export default ListingListItem;
