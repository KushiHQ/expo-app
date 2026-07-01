import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

/**
 * Faint radial "cloud" light behind a screen's content — the atmospheric depth of
 * the soft/cloudy language ([[reference_design_system_soft_cloudy]]). A warm glow
 * from the top and a cool one off to the side, both very low opacity so they read
 * as ambient light on near-black, not color. Absolutely positioned + non-interactive
 * so it never affects layout or touches.
 */
const AmbientGlow: React.FC = () => (
  <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%">
      <Defs>
        <RadialGradient id="ambient-warm" cx="50%" cy="0%" rx="85%" ry="55%" fx="50%" fy="0%">
          <Stop offset="0%" stopColor="#FFA500" stopOpacity="0.11" />
          <Stop offset="65%" stopColor="#FFA500" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="ambient-cool" cx="93%" cy="14%" rx="70%" ry="45%" fx="93%" fy="14%">
          <Stop offset="0%" stopColor="#5B8CFF" stopOpacity="0.09" />
          <Stop offset="60%" stopColor="#5B8CFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ambient-warm)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ambient-cool)" />
    </Svg>
  </View>
);

export default AmbientGlow;
