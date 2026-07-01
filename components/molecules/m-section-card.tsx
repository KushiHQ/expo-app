import ThemedText from '@/components/atoms/a-themed-text';
import Surface from '@/components/atoms/a-surface';
import { Fonts } from '@/lib/constants/theme';
import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SectionCard({ icon, title, subtitle, children, style }: Props) {
  const colors = useThemeColors();
  return (
    <Surface radius={22} style={{ overflow: 'hidden' }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 15,
          paddingBottom: 11,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: hexToRgba(colors.primary, 0.12),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontFamily: Fonts.semibold, fontSize: 14 }}>{title}</ThemedText>
          {subtitle && (
            <ThemedText
              style={{
                fontSize: 11,
                color: hexToRgba(colors.text, 0.45),
                marginTop: 1,
              }}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      <View style={[{ padding: 16, paddingTop: 4, gap: 14 }, style]}>{children}</View>
    </Surface>
  );
}
