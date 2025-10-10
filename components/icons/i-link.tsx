import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { Path } from "react-native-svg";

export const LinkIcon: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 25}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 25 24"
      fill="trasparent"
      {...props}
    >
      <Path
        d="M14 12C14 15.18 11.43 17.75 8.25 17.75C5.07 17.75 2.5 15.18 2.5 12C2.5 8.82 5.07 6.25 8.25 6.25"
        stroke={props.color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 12C10.5 8.69 13.19 6 16.5 6C19.81 6 22.5 8.69 22.5 12C22.5 15.31 19.81 18 16.5 18"
        stroke={props.color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
