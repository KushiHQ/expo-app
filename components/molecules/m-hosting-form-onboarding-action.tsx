import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { CustomSvgProps } from '@/lib/types/svgType';
import { hexToRgba } from '@/lib/utils/colors';
import { SURFACE } from '@/lib/constants/surface';
import { PROPERTY_BLURHASH } from '@/lib/constants/images';
import { Image } from 'expo-image';
import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

export type HostingActionItem = {
  icon: LucideIcon | React.FC<CustomSvgProps>;
  title: string;
  description: string;
};

type Props = {
  icon: LucideIcon | React.FC<CustomSvgProps>;
  /** When set, shows this image (e.g. a unit's cover photo) instead of the icon. */
  image?: string;
  onPress?: () => void;
  disabled?: boolean;
  color?: 'primary' | 'accent' | 'default';
  children?: React.ReactNode;
};

const HostingFormOnboardingAction: React.FC<Props> = ({
  onPress,
  disabled,
  color = 'default',
  icon,
  image,
  children,
}) => {
  const colors = useThemeColors();

  const Icon = icon;
  const leadingBorderColor =
    color === 'primary'
      ? hexToRgba(colors.primary, 0.2)
      : color === 'accent'
        ? hexToRgba(colors.accent, 0.2)
        : hexToRgba(colors.text, 0.1);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={twMerge(
        'flex-row items-center gap-4 rounded-3xl p-[14px]',
        disabled && 'opacity-50',
      )}
      style={{
        backgroundColor:
          color === 'primary'
            ? hexToRgba(colors.primary, 0.15)
            : color === 'accent'
              ? hexToRgba(colors.accent, 0.15)
              : hexToRgba(colors.text, 0.05),
        boxShadow: color === 'primary' ? SURFACE.glow : SURFACE.shadow,
      }}
    >
      {image ? (
        <View
          className="h-12 w-12 overflow-hidden rounded-2xl border"
          style={{ borderColor: leadingBorderColor }}
        >
          <Image
            source={{ uri: image }}
            style={{ height: '100%', width: '100%' }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: PROPERTY_BLURHASH }}
            placeholderContentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
      ) : (
        <View
          className="h-12 w-12 items-center justify-center rounded-full border"
          style={{
            backgroundColor: hexToRgba(colors.primary, 0.1),
            borderColor: leadingBorderColor,
          }}
        >
          <Icon size={20} color={colors.text} />
        </View>
      )}
      {children}
    </Pressable>
  );
};

export default HostingFormOnboardingAction;
