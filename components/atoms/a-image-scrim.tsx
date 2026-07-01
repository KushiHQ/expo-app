import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleProp, ViewStyle } from 'react-native';

type Props = {
  /** Where the scrim sits. 'bottom' (default) darkens the lower portion for
   *  overlaid text; 'top' darkens the top for top-anchored controls. */
  from?: 'bottom' | 'top';
  /** Peak darkness at the anchored edge (0–1). */
  intensity?: number;
  /** Fraction of the image height the scrim covers. */
  height?: number | string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A soft dark gradient laid over an image so overlaid white text / pills stay
 * legible without a hard band. Part of the soft/cloudy language — used on
 * cinematic listing covers.
 */
const ImageScrim: React.FC<Props> = ({
  from = 'bottom',
  intensity = 0.55,
  height = '65%',
  style,
}) => {
  const isBottom = from === 'bottom';
  return (
    <LinearGradient
      colors={[
        `rgba(0,0,0,${isBottom ? 0 : intensity})`,
        `rgba(0,0,0,${isBottom ? intensity * 0.35 : 0})`,
        `rgba(0,0,0,${isBottom ? intensity : 0})`,
      ]}
      locations={[0, 0.6, 1]}
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          [isBottom ? 'bottom' : 'top']: 0,
          height: height as ViewStyle['height'],
        },
        style,
      ]}
    />
  );
};

export default ImageScrim;
