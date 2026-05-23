import { FluentSlideTextEdit28Regular } from '@/components/icons/i-edit';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { Pressable, View } from 'react-native';
import ThemedText from '../atoms/a-themed-text';

type Props = {
  icon: React.ReactNode;
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
};

const ReviewSection: React.FC<Props> = ({ icon, title, onEdit, children }) => {
  const colors = useThemeColors();
  return (
    <View
      style={{
        borderRadius: 16,
        backgroundColor: colors['surface-01'],
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 13,
          gap: 9,
        }}
      >
        {icon}
        <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 14, flex: 1 }}>
          {title}
        </ThemedText>
        {onEdit && (
          <Pressable onPress={onEdit} hitSlop={12}>
            <FluentSlideTextEdit28Regular color={hexToRgba(colors.text, 0.3)} size={16} />
          </Pressable>
        )}
      </View>
      <View
        style={{
          height: 1,
          backgroundColor: hexToRgba(colors.text, 0.07),
          marginHorizontal: 16,
        }}
      />
      <View style={{ padding: 16, gap: 13 }}>{children}</View>
    </View>
  );
};

export default ReviewSection;
