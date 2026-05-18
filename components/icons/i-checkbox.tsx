import { CustomSvgProps } from '@/lib/types/svgType';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function CheckboxUnchecked(props: CustomSvgProps) {
  return (
    <Svg width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 16 16" {...props}>
      <Path
        fill="currentColor"
        d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5zm2.5-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1z"
      ></Path>
    </Svg>
  );
}

export function CheckboxChecked(props: CustomSvgProps) {
  return (
    <Svg width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 16 16" {...props}>
      <Path
        fill="currentColor"
        d="M4.5 2A2.5 2.5 0 0 0 2 4.5v7A2.5 2.5 0 0 0 4.5 14h7a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 11.5 2zm6.354 4.854l-3.5 3.5a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 9.293l3.146-3.147a.5.5 0 0 1 .708.708"
      ></Path>
    </Svg>
  );
}
