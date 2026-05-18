import { View, type ViewProps } from 'react-native';

import { useThemeColors } from '@/lib/hooks/use-theme-color';
import React from 'react';

const ThemedView: React.FC<ViewProps> = ({ style, ...otherProps }) => {
  const colors = useThemeColors();

  return <View style={[{ backgroundColor: colors['background'] }, style]} {...otherProps} />;
};

export default ThemedView;
