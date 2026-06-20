import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

export const HeroiconsCamera: React.FC<CustomSvgProps> = (props) => {
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
        <Path d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23q-.57.08-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a48 48 0 0 0-1.134-.175a2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.19 2.19 0 0 0-1.736-1.039a49 49 0 0 0-5.232 0a2.19 2.19 0 0 0-1.736 1.039z"></Path>
        <Path d="M16.5 12.75a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m2.25-2.25h.008v.008h-.008z"></Path>
      </G>
    </Svg>
  );
};

export const CameraLinear: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <G fill="none" stroke="currentColor" strokeWidth={1.5}>
        <Circle cx={12} cy={13} r={3}></Circle>
        <Path d="M9.778 21h4.444c3.121 0 4.682 0 5.803-.735a4.4 4.4 0 0 0 1.226-1.204c.749-1.1.749-2.633.749-5.697s0-4.597-.749-5.697a4.4 4.4 0 0 0-1.226-1.204c-.72-.473-1.622-.642-3.003-.702c-.659 0-1.226-.49-1.355-1.125A2.064 2.064 0 0 0 13.634 3h-3.268c-.988 0-1.839.685-2.033 1.636c-.129.635-.696 1.125-1.355 1.125c-1.38.06-2.282.23-3.003.702A4.4 4.4 0 0 0 2.75 7.667C2 8.767 2 10.299 2 13.364s0 4.596.749 5.697c.324.476.74.885 1.226 1.204C5.096 21 6.657 21 9.778 21Z"></Path>
        <Path strokeLinecap="round" d="M19 10h-1"></Path>
      </G>
    </Svg>
  );
};
