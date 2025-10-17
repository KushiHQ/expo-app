import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export const CarbonCircleOutline: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 32}
			height={props.height ?? props.size ?? 32}
			viewBox="0 0 32 32"
			{...props}
		>
			<Path
				fill="currentColor"
				d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14s14-6.268 14-14S23.732 2 16 2m0 26C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12s-5.373 12-12 12"
			></Path>
		</Svg>
	);
};

export const CarbonCircleFilled: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 32}
			height={props.height ?? props.size ?? 32}
			viewBox="0 0 32 32"
			{...props}
		>
			<Circle cx={16} cy={16} r={10} fill="currentColor"></Circle>
			<Path
				fill="currentColor"
				d="M16 30a14 14 0 1 1 14-14a14.016 14.016 0 0 1-14 14m0-26a12 12 0 1 0 12 12A12.014 12.014 0 0 0 16 4"
			></Path>
		</Svg>
	);
};

export const IconParkOutlineDot: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 48}
			height={props.height ?? props.size ?? 48}
			viewBox="0 0 48 48"
			{...props}
		>
			<Path
				fill="currentColor"
				stroke="currentColor"
				strokeWidth={4}
				d="M24 33a9 9 0 1 0 0-18a9 9 0 0 0 0 18Z"
			></Path>
		</Svg>
	);
};
