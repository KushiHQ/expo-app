import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const MaterialSymbolsLightMapOutlineRounded: React.FC<CustomSvgProps> = (
	props,
) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 24}
			height={props.height ?? props.size ?? 24}
			viewBox="0 0 24 24"
			{...props}
		>
			<Path
				fill="currentColor"
				d="M14.485 19.737L9 17.823l-3.902 1.509q-.21.084-.401.053q-.192-.03-.354-.132t-.252-.274T4 18.583V6.41q0-.282.13-.499t.378-.303l3.957-1.344q.124-.05.257-.075q.134-.025.278-.025t.277.025t.257.075L15 6.177l3.902-1.508q.21-.084.401-.054t.354.132q.161.102.252.274t.091.396v12.259q0 .284-.159.495q-.158.212-.426.298l-3.9 1.287q-.13.05-.256.065q-.125.015-.26.015q-.136 0-.26-.024t-.255-.075m.016-1.033v-11.7l-5-1.746v11.7zm1 0L19 17.55V5.7l-3.5 1.304zM5 18.3l3.5-1.342v-11.7L5 6.45zM15.5 7.004v11.7zm-7-1.746v11.7z"
			></Path>
		</Svg>
	);
};

export const TablerMapPinFilled: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 24}
			height={props.height ?? props.size ?? 24}
			viewBox="0 0 24 24"
			{...props}
		>
			<Path
				fill="currentColor"
				d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203.21l-4.243 4.242a3 3 0 0 1-4.097.135l-.144-.135l-4.244-4.243A9 9 0 0 1 18.364 4.636M12 8a3 3 0 1 0 0 6a3 3 0 0 0 0-6"
			></Path>
		</Svg>
	);
};

export const TypcnCompass: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 24}
			height={props.height ?? props.size ?? 24}
			viewBox="0 0 24 24"
			{...props}
		>
			<Path
				fill="currentColor"
				d="M12 5c3.859.001 7 3.142 7 7.001c0 3.858-3.141 6.998-7 6.999s-7-3.14-7-6.999s3.141-7 7-7.001m0-2a9 9 0 0 0 0 18a9 9 0 0 0 0-18m4.182 4.819a.5.5 0 0 0-.491-.127L9.74 9.398a.5.5 0 0 0-.342.343l-1.707 5.951a.496.496 0 0 0 .481.637l.138-.02l5.95-1.708a.5.5 0 0 0 .342-.343l1.707-5.949a.5.5 0 0 0-.127-.49M8.9 15.101l1.383-4.817l3.434 3.435z"
			></Path>
		</Svg>
	);
};

export const PhCompassRoseDuotone: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 256}
			height={props.height ?? props.size ?? 256}
			viewBox="0 0 256 256"
			{...props}
		>
			<G fill="currentColor">
				<Path
					d="m248 128l-96 24l-24 96l-24-96l-96-24l96-24l24-96l24 96Z"
					opacity={0.2}
				></Path>
				<Path d="m249.94 120.24l-27.05-6.76a95.86 95.86 0 0 0-80.37-80.37l-6.76-27a8 8 0 0 0-15.52 0l-6.76 27.05a95.86 95.86 0 0 0-80.37 80.37l-27 6.76a8 8 0 0 0 0 15.52l27.05 6.76a95.86 95.86 0 0 0 80.37 80.37l6.76 27.05a8 8 0 0 0 15.52 0l6.76-27.05a95.86 95.86 0 0 0 80.37-80.37l27.05-6.76a8 8 0 0 0 0-15.52Zm-95.49 22.9L139.31 128l15.14-15.14L215 128Zm-52.9 0L41 128l60.57-15.14L116.69 128Zm104.22-33.94L158.6 97.4l-11.8-47.17a79.88 79.88 0 0 1 58.97 58.97m-62.63-7.65L128 116.69l-15.14-15.14L128 41ZM109.2 50.23L97.4 97.4l-47.17 11.8a79.88 79.88 0 0 1 58.97-58.97m-59 96.57l47.2 11.8l11.8 47.17a79.88 79.88 0 0 1-58.97-58.97Zm62.63 7.65L128 139.31l15.14 15.14L128 215Zm33.94 51.32l11.8-47.17l47.17-11.8a79.88 79.88 0 0 1-58.94 58.97Z"></Path>
			</G>
		</Svg>
	);
};
