import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const IconoirElevator: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <G
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <Path d="M12 3v18m9-17.4v16.8a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6V3.6a.6.6 0 0 1 .6-.6h16.8a.6.6 0 0 1 .6.6"></Path>
        <Path d="m6 12l1.5-2L9 12m6 0l1.5 2l1.5-2"></Path>
      </G>
    </Svg>
  );
};
