import { CustomSvgProps } from '@/lib/types/svgType';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const LetsIconsBoxOpenFillDuotone: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill="currentColor"
        d="M5 12h14v4c0 1.886 0 2.828-.586 3.414S16.886 20 15 20H9c-1.886 0-2.828 0-3.414-.586S5 17.886 5 16z"
      ></Path>
      <Path
        fill="currentColor"
        fillOpacity={0.25}
        fillRule="evenodd"
        d="M2.815 7.815L5 10v1h14v-1l2.185-2.185a1 1 0 0 0-.107-1.507l-2.512-1.883a1 1 0 0 0-1.155-.033L15 6H9L6.589 4.392a1 1 0 0 0-1.155.032L2.922 6.309a1 1 0 0 0-.107 1.507M8.6 7.2h6.8l1.95 2.6H6.65z"
        clipRule="evenodd"
      ></Path>
    </Svg>
  );
};
