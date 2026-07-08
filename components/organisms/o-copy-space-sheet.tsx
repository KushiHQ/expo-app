import React from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MapPin } from 'lucide-react-native';

import BottomSheet from '../atoms/a-bottom-sheet';
import ThemedText from '../atoms/a-themed-text';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { toast } from '@/lib/hooks/use-toast';
import { hexToRgba } from '@/lib/utils/colors';
import { handleError } from '@/lib/utils/error';
import { getAssetResizeUrl } from '@/lib/utils/urls';
import {
  useCopyHostingRoomMutation,
  useHostingQuery,
} from '@/lib/services/graphql/generated';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** The saved space being copied. */
  roomId: string;
  roomName: string;
  /** The unit the space currently belongs to (excluded from targets). */
  currentHostingId: string;
  /** The parent property — targets are its other units (siblings). */
  currentParentId?: string | null;
};

/**
 * Target picker for "copy this space to another unit" — the field-team shortcut
 * for estates whose sibling units share identical spaces. Targets are the other
 * units of the same parent property. Photos are copied by reference (no
 * re-upload), so this is instant.
 */
const CopySpaceSheet: React.FC<Props> = ({
  visible,
  onClose,
  roomId,
  roomName,
  currentHostingId,
  currentParentId,
}) => {
  const colors = useThemeColors();
  const [copyingId, setCopyingId] = React.useState<string | null>(null);
  const [, copyRoom] = useCopyHostingRoomMutation();

  // The listings query excludes child units, so siblings must come from the
  // parent's `children`. Fetch the parent and read its units.
  const [{ data, fetching }] = useHostingQuery({
    variables: { hostingId: currentParentId ?? '', childrenOnSale: false },
    pause: !visible || !currentParentId,
  });

  const targets = React.useMemo(
    () => (data?.hosting?.children ?? []).filter((h) => h.id !== currentHostingId),
    [data, currentHostingId],
  );

  const handleCopy = async (target: (typeof targets)[number]) => {
    if (copyingId) return;
    setCopyingId(target.id);
    const res = await copyRoom({ hostingRoomId: roomId, targetHostingId: target.id });
    setCopyingId(null);
    if (res.error) {
      handleError(res.error);
      return;
    }
    toast.show({
      type: 'success',
      text1: 'Space copied',
      text2: `${roomName} added to ${target.title ?? 'the unit'}`,
    });
    onClose();
  };

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View className="gap-4 pb-2">
        <View className="gap-1">
          <ThemedText style={{ fontSize: 16, fontFamily: Fonts.semibold }}>
            Copy “{roomName}” to another unit
          </ThemedText>
          <ThemedText style={{ fontSize: 12.5, color: hexToRgba(colors.text, 0.5) }}>
            The space and its photos are copied — the original stays untouched.
          </ThemedText>
        </View>

        {fetching && targets.length === 0 ? (
          <View className="items-center py-8">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : targets.length === 0 ? (
          <ThemedText
            className="py-6 text-center"
            style={{ color: hexToRgba(colors.text, 0.5) }}
          >
            This property has no other units to copy to.
          </ThemedText>
        ) : (
          <View className="gap-2.5">
            {targets.map((h) => (
              <Pressable
                key={h.id}
                disabled={!!copyingId}
                onPress={() => handleCopy(h)}
                className="flex-row items-center gap-3 rounded-2xl p-2.5"
                style={{ backgroundColor: hexToRgba(colors.text, 0.05) }}
              >
                <View className="h-12 w-14 overflow-hidden rounded-xl">
                  <Image
                    source={{
                      uri: h.coverImage?.asset?.id
                        ? getAssetResizeUrl(h.coverImage.asset.id, 120, 120, 80)
                        : h.coverImage?.asset?.publicUrl,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    placeholder={{ blurhash: PROPERTY_BLURHASH }}
                    placeholderContentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <ThemedText
                    numberOfLines={1}
                    style={{ fontSize: 14, fontFamily: Fonts.semibold }}
                  >
                    {h.title ?? 'Untitled unit'}
                  </ThemedText>
                  <View className="flex-row items-center gap-1">
                    <MapPin size={11} color={hexToRgba(colors.text, 0.4)} />
                    <ThemedText
                      numberOfLines={1}
                      style={{ fontSize: 12, color: hexToRgba(colors.text, 0.5) }}
                    >
                      {[h.city, h.state].filter(Boolean).join(', ') || '—'}
                    </ThemedText>
                  </View>
                </View>
                {copyingId === h.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

export default CopySpaceSheet;
