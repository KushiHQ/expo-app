import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const SolarHome2Bold: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill="currentColor"
        fillRule="evenodd"
        d="M2.52 7.823C2 8.77 2 9.915 2 12.203v1.522c0 3.9 0 5.851 1.172 7.063S6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.212S22 17.626 22 13.725v-1.521c0-2.289 0-3.433-.52-4.381c-.518-.949-1.467-1.537-3.364-2.715l-2-1.241C14.111 2.622 13.108 2 12 2s-2.11.622-4.116 1.867l-2 1.241C3.987 6.286 3.038 6.874 2.519 7.823M11.25 18a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0z"
        clipRule="evenodd"
      ></Path>
    </Svg>
  );
};

export const SolarHome2Linear: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <G fill="none" stroke="currentColor" strokeWidth={1.5}>
        <Path d="M2 12.204c0-2.289 0-3.433.52-4.381c.518-.949 1.467-1.537 3.364-2.715l2-1.241C9.889 2.622 10.892 2 12 2s2.11.622 4.116 1.867l2 1.241c1.897 1.178 2.846 1.766 3.365 2.715S22 9.915 22 12.203v1.522c0 3.9 0 5.851-1.172 7.063S17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.212S2 17.626 2 13.725z"></Path>
        <Path strokeLinecap="round" d="M12 15v3"></Path>
      </G>
    </Svg>
  );
};

export const CuidaBuildingOutline: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <G className="building-outline">
        <G fill="currentColor" className="Vector">
          <Path
            fillRule="evenodd"
            d="M8 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3zm3-1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
            clipRule="evenodd"
          ></Path>
          <Path
            fillRule="evenodd"
            d="M2 11a3 3 0 0 1 3-3h4.5v2H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.5v2H5a3 3 0 0 1-3-3z"
            clipRule="evenodd"
          ></Path>
          <Path
            fillRule="evenodd"
            d="M12 17a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3h-2v-3h-2v3h-2z"
            clipRule="evenodd"
          ></Path>
          <Path d="M12 6a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm0 5a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm-7 4a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm11-9a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0zm0 5a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0z"></Path>
        </G>
      </G>
    </Svg>
  );
};

export const BiHouses: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 16 16"
      {...props}
    >
      <Path
        fill="currentColor"
        d="M5.793 1a1 1 0 0 1 1.414 0l.647.646a.5.5 0 1 1-.708.708L6.5 1.707L2 6.207V12.5a.5.5 0 0 0 .5.5a.5.5 0 0 1 0 1A1.5 1.5 0 0 1 1 12.5V7.207l-.146.147a.5.5 0 0 1-.708-.708zm3 1a1 1 0 0 1 1.414 0L12 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l1.854 1.853a.5.5 0 0 1-.708.708L15 8.207V13.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 13.5V8.207l-.146.147a.5.5 0 1 1-.708-.708zm.707.707L5 7.207V13.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V7.207z"
      ></Path>
    </Svg>
  );
};

export const BiHousesFill: React.FC<CustomSvgProps> = (props) => {
  return (
    <Svg
      width={props.width ?? props.size ?? 24}
      height={props.height ?? props.size ?? 24}
      viewBox="0 0 16 16"
      {...props}
    >
      <G fill="currentColor">
        <Path d="M7.207 1a1 1 0 0 0-1.414 0L.146 6.646a.5.5 0 0 0 .708.708L1 7.207V12.5A1.5 1.5 0 0 0 2.5 14h.55a2.5 2.5 0 0 1-.05-.5V9.415a1.5 1.5 0 0 1-.56-2.475l5.353-5.354z"></Path>
        <Path d="M8.793 2a1 1 0 0 1 1.414 0L12 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l1.854 1.853a.5.5 0 0 1-.708.708L15 8.207V13.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 13.5V8.207l-.146.147a.5.5 0 1 1-.708-.708z"></Path>
      </G>
    </Svg>
  );
};
