import { useThemeColors } from '@/lib/hooks/use-theme-color';
import { hexToRgba } from '@/lib/utils/colors';
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface LoadingDotsProps {
  size?: number;
  gap?: number;
  styles?: ViewStyle;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 10, gap = 12, styles: outerStyles }) => {
  const colors = useThemeColors();
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
    };
    const parallelAnimations = animations.map((anim, index) => {
      anim.setValue(0.3); // Set initial opacity/scale
      return createAnimation(anim, index * 250);
    });
    Animated.parallel(parallelAnimations).start();
  }, [animations]);

  return (
    <View
      style={[
        styles.container,
        { gap, backgroundColor: hexToRgba(colors['primary'], 0.05) },
        outerStyles,
      ]}
    >
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors['primary'],
              opacity: anim,
              transform: [
                {
                  scale: anim.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingInline: 16,
    borderRadius: 30,
  },
  circle: {
    position: 'relative',
  },
});

export default LoadingDots;
