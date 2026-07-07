import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { PublishStatus } from '@/lib/services/graphql/generated';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import { formatPaymentInterval } from '@/lib/utils/hosting/interval';
import { abbreviateNumber } from '@/lib/utils/number';
import { Image } from 'expo-image';
import { ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';

type Props = {
  title?: string | null;
  coverUrl?: string;
  price?: string | number | null;
  paymentInterval?: string | null;
  publishStatus?: PublishStatus | null;
  onPress?: () => void;
  /** When set, shows a delete affordance for this unit. */
  onDelete?: () => void;
};

const STATUS: Record<string, { label: string; color: string }> = {
  [PublishStatus.Live]: { label: 'Live', color: '#22C55E' },
  [PublishStatus.Inreview]: { label: 'In review', color: '#F59E0B' },
  [PublishStatus.Rejected]: { label: 'Rejected', color: '#EF4444' },
  [PublishStatus.Archived]: { label: 'Archived', color: '#9CA3AF' },
  [PublishStatus.Draft]: { label: 'Draft', color: '#9CA3AF' },
};

/**
 * A unit (child hosting) on a plaza's onboarding screen. Purpose-built rather
 * than reusing the generic action row: a prominent cover, the unit's price, and
 * a colour-coded publish-status pill so a host can scan their units at a glance.
 */
const HostingUnitCard: React.FC<Props> = ({
  title,
  coverUrl,
  price,
  paymentInterval,
  publishStatus,
  onPress,
  onDelete,
}) => {
  const colors = useThemeColors();
  const status = STATUS[publishStatus ?? PublishStatus.Draft] ?? STATUS[PublishStatus.Draft];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[20px] p-2.5"
      style={{
        backgroundColor: hexToRgba(colors.text, 0.05),
        boxShadow: SURFACE.shadow,
      }}
    >
      {/* Cover */}
      <View
        className="h-[88px] w-[104px] overflow-hidden rounded-2xl"
        style={{ backgroundColor: hexToRgba(colors.text, 0.06) }}
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            recyclingKey={coverUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ImageIcon size={22} color={hexToRgba(colors.text, 0.3)} />
          </View>
        )}
      </View>

      {/* Body */}
      <View className="flex-1 gap-1.5">
        <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 15 }} numberOfLines={1}>
          {title || 'Untitled unit'}
        </ThemedText>
        <View>
          <ThemedText
            style={{ fontFamily: Fonts.bold, fontSize: 15, color: colors.primary }}
            numberOfLines={1}
          >
            {price ? `₦${abbreviateNumber(Number(price))}` : 'No price set'}
          </ThemedText>
          {formatPaymentInterval(paymentInterval) ? (
            <ThemedText
              style={{
                fontSize: 11,
                fontFamily: Fonts.medium,
                color: hexToRgba(colors.text, 0.4),
              }}
            >
              {formatPaymentInterval(paymentInterval)}
            </ThemedText>
          ) : null}
        </View>
        <View
          className="mt-0.5 flex-row items-center gap-1.5 self-start rounded-full px-2 py-0.5"
          style={{ backgroundColor: hexToRgba(status.color, 0.16) }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.color }} />
          <ThemedText style={{ fontSize: 11, fontFamily: Fonts.semibold, color: status.color }}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      {/* Delete + drill-in affordances */}
      <View className="flex-row items-center" style={{ gap: 2 }}>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 6 }}>
            <Trash2 size={17} color={hexToRgba(colors.text, 0.4)} />
          </Pressable>
        ) : null}
        <ChevronRight size={20} color={hexToRgba(colors.text, 0.4)} />
      </View>
    </Pressable>
  );
};

export default HostingUnitCard;
