import { CustomSvgProps } from '@/lib/types/svgType';
import React from 'react';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

export const SolarCardBold: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <Defs>
        <Mask id="SVGBcZ8Eejn">
          <G fill="none">
            <Path
              fill="#fff"
              d="M14 4h-4C6.229 4 4.343 4 3.172 5.172c-.844.843-1.08 2.057-1.146 4.078h19.948c-.066-2.021-.302-3.235-1.146-4.078C19.657 4 17.771 4 14 4m-4 16h4c3.771 0 5.657 0 6.828-1.172S22 15.771 22 12q0-.662-.002-1.25H2.002Q1.999 11.338 2 12c0 3.771 0 5.657 1.172 6.828S6.229 20 10 20"
            ></Path>
            <Path
              fill="#000"
              fillRule="evenodd"
              d="M5.25 16a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75m6.5 0a.75.75 0 0 1 .75-.75H14a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75"
              clipRule="evenodd"
            ></Path>
          </G>
        </Mask>
      </Defs>
      <Path fill="currentColor" d="M0 0h24v24H0z" mask="url(#SVGBcZ8Eejn)"></Path>
    </Svg>
  );
};

export const LogosMastercard: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 256}
      height={props.height ?? props.size ?? 199}
      viewBox="0 0 256 199"
      {...props}
    >
      <Path fill="#ff5f00" d="M93.298 16.903h69.15v124.251h-69.15z"></Path>
      <Path
        fill="#eb001b"
        d="M97.689 79.029c0-25.245 11.854-47.637 30.074-62.126C114.373 6.366 97.47 0 79.03 0C35.343 0 0 35.343 0 79.029s35.343 79.029 79.029 79.029c18.44 0 35.343-6.366 48.734-16.904c-18.22-14.269-30.074-36.88-30.074-62.125"
      ></Path>
      <Path
        fill="#f79e1b"
        d="M255.746 79.029c0 43.685-35.343 79.029-79.029 79.029c-18.44 0-35.343-6.366-48.734-16.904c18.44-14.488 30.075-36.88 30.075-62.125s-11.855-47.637-30.075-62.126C141.373 6.366 158.277 0 176.717 0c43.686 0 79.03 35.563 79.03 79.029"
      ></Path>
    </Svg>
  );
};

export const MdiIntegratedCircuitChip: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill="currentColor"
        d="M10 4h10c1.11 0 2 .89 2 2v2h-3.41L16 10.59v4l-2 2V20h-4v-3.41l-2-2V9.41l2-2zm8 7.41V14h4v-4h-2.59zM6.59 8L8 6.59V4H4c-1.11 0-2 .89-2 2v2zM6 14v-4H2v4zm2 3.41L6.59 16H2v2c0 1.11.89 2 2 2h4zM17.41 16L16 17.41V20h4c1.11 0 2-.89 2-2v-2z"
      ></Path>
    </Svg>
  );
};
