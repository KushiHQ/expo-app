import { CustomSvgProps } from '@/lib/types/svgType';
import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const WaveRectangle: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 390}
      height={props.height ?? props.size ?? 391}
      viewBox="0 0 390 391"
      fill="none"
    >
      <G style="mix-blend-mode:color-burn">
        <Path
          d="M-61.5001 258.5C15.2553 175.368 133.74 209.589 243.242 181.098C371.88 147.628 526.5 0 526.5 0L534.204 391H-143.285C-143.285 391 -106.026 306.725 -61.5001 258.5Z"
          fill={props.color}
        />
      </G>
    </Svg>
  );
};

export default WaveRectangle;
