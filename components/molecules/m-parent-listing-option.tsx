import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Check, Building2 } from 'lucide-react-native';
import ThemedText from '../atoms/a-themed-text';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import { Fonts } from '@/lib/constants/theme';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import type { SelectionDetails } from './m-select-input';

/** Option shape for the parent-listing picker (see step-1 hosting form). */
export type ParentListingOptionType = {
  label: string;
  value: string;
  image?: string | null;
  location?: string;
  description?: string | null;
};

/**
 * Rich select row for choosing a parent property: thumbnail + title, location,
 * and a one-line description — so a host can tell their listings apart at a
 * glance instead of picking from bare titles.
 */
export const ParentListingOption: React.FC<ParentListingOptionType & SelectionDetails> = ({
  label,
  image,
  location,
  description,
  selected,
}) => {
  const colors = useThemeColors();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: selected ? hexToRgba(colors.primary, 0.14) : hexToRgba(colors.text, 0.05),
        gap: 12,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: hexToRgba(colors.text, 0.08),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            cachePolicy="memory-disk"
          />
        ) : (
          <Building2 size={20} color={hexToRgba(colors.text, 0.4)} />
        )}
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText numberOfLines={1} style={{ fontFamily: Fonts.medium, fontSize: 15 }}>
          {label}
        </ThemedText>
        {!!location && (
          <ThemedText numberOfLines={1} style={{ fontSize: 12, color: colors.primary }}>
            {location}
          </ThemedText>
        )}
        {!!description && (
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontSize: 12, color: hexToRgba(colors.text, 0.5), lineHeight: 17 }}
          >
            {description}
          </ThemedText>
        )}
      </View>

      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: selected ? colors.primary : hexToRgba(colors.text, 0.08),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <Check size={13} color={colors['primary-content']} strokeWidth={3} />}
      </View>
    </View>
  );
};

export default ParentListingOption;
