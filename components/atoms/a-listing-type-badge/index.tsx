import React from 'react';
import { View } from 'react-native';
import ThemedText from '../a-themed-text';
import { Fonts } from '@/lib/constants/theme';
import { ListingType } from '@/lib/services/graphql/generated';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';

type Props = {
  listingType?: ListingType | null;
  /** `overlay` for use on top of an image (card); `surface` on a page. */
  variant?: 'overlay' | 'surface';
};

const ListingTypeBadge: React.FC<Props> = ({ listingType, variant = 'surface' }) => {
  const colors = useThemeColors();
  if (!listingType) return null;

  const isSale = listingType === ListingType.Sale;
  const label = isSale ? 'For Sale' : 'For Rent';
  const overlay = variant === 'overlay';

  // Sale stands out in emerald; rent reads neutral. Always legible on both a
  // photo (overlay) and the themed page (surface).
  const dotColor = isSale ? colors.accent : overlay ? '#fff' : hexToRgba(colors.text, 0.5);
  const textColor = overlay ? '#fff' : isSale ? colors.accent : hexToRgba(colors.text, 0.8);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: overlay
          ? 'rgba(0,0,0,0.55)'
          : hexToRgba(isSale ? colors.accent : colors.text, isSale ? 0.14 : 0.07),
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />
      <ThemedText
        style={{ fontSize: 11, fontFamily: Fonts.semibold, letterSpacing: 0.3, color: textColor }}
      >
        {label}
      </ThemedText>
    </View>
  );
};

export default ListingTypeBadge;
