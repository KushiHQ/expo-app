import { CustomSvgProps } from "@/lib/types/svgType";
import React from "react";
import Svg, { Path } from "react-native-svg";

export const FluentAppsList24Filled: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 24}
			height={props.height ?? props.size ?? 24}
			viewBox="0 0 24 24"
			{...props}
		>
			<Path
				fill="currentColor"
				d="M6.248 16.002c.966 0 1.75.784 1.75 1.75v2.498A1.75 1.75 0 0 1 6.248 22H3.75A1.75 1.75 0 0 1 2 20.25v-2.498c0-.966.784-1.75 1.75-1.75zM9.748 18h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493zh11.505zm-3.5-8.999c.966 0 1.75.784 1.75 1.75v2.498a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 13.249V10.75C2 9.784 2.784 9 3.75 9zM9.748 11h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493zh11.505zm-3.5-9c.966 0 1.75.784 1.75 1.75v2.498a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 6.248V3.75C2 2.784 2.784 2 3.75 2zm3.5 2h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493zh11.505z"
			></Path>
		</Svg>
	);
};

export const FluentAppsList24Regular: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 24}
			height={props.height ?? props.size ?? 24}
			viewBox="0 0 24 24"
			{...props}
		>
			<Path
				fill="currentColor"
				d="M6.248 16.002c.966 0 1.75.784 1.75 1.75v2.498A1.75 1.75 0 0 1 6.248 22H3.75A1.75 1.75 0 0 1 2 20.25v-2.498c0-.966.784-1.75 1.75-1.75zm0 1.5H3.75a.25.25 0 0 0-.25.25v2.498c0 .138.112.25.25.25h2.498a.25.25 0 0 0 .25-.25v-2.498a.25.25 0 0 0-.25-.25m3.5.498h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493zh11.505zm-3.5-8.999c.966 0 1.75.784 1.75 1.75v2.498a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 13.249V10.75C2 9.784 2.784 9 3.75 9zm0 1.5H3.75a.25.25 0 0 0-.25.25v2.498c0 .138.112.25.25.25h2.498a.25.25 0 0 0 .25-.25V10.75a.25.25 0 0 0-.25-.25m3.5.499h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493zh11.505zm-3.5-9c.966 0 1.75.784 1.75 1.75v2.498a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 6.248V3.75C2 2.784 2.784 2 3.75 2zm0 1.5H3.75a.25.25 0 0 0-.25.25v2.498c0 .138.112.25.25.25h2.498a.25.25 0 0 0 .25-.25V3.75a.25.25 0 0 0-.25-.25m3.5.5h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493zh11.505z"
			></Path>
		</Svg>
	);
};

export const MultiList: React.FC<CustomSvgProps> = (props) => {
	return (
		<Svg
			width={props.width ?? props.size ?? 24}
			height={props.height ?? props.size ?? 24}
			viewBox="0 0 18 18"
			{...props}
		>
			<Path
				d="M7.875 6.39V2.985C7.875 1.9275 7.395 1.5 6.2025 1.5H3.1725C1.98 1.5 1.5 1.9275 1.5 2.985V6.3825C1.5 7.4475 1.98 7.8675 3.1725 7.8675H6.2025C7.395 7.875 7.875 7.4475 7.875 6.39Z"
				stroke="currentColor"
				fill="transparent"
				stroke-width="1.125"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<Path
				d="M7.875 14.8275V11.7975C7.875 10.605 7.395 10.125 6.2025 10.125H3.1725C1.98 10.125 1.5 10.605 1.5 11.7975V14.8275C1.5 16.02 1.98 16.5 3.1725 16.5H6.2025C7.395 16.5 7.875 16.02 7.875 14.8275Z"
				stroke="currentColor"
				fill="transparent"
				stroke-width="1.125"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<Path
				d="M11.25 12H15.75"
				stroke="currentColor"
				stroke-width="1.125"
				stroke-linecap="round"
			/>
			<Path
				d="M11.25 15H15.75"
				stroke="currentColor"
				stroke-width="1.125"
				stroke-linecap="round"
			/>
			<Path
				d="M11.25 3H15.75"
				stroke="currentColor"
				stroke-width="1.125"
				stroke-linecap="round"
			/>
			<Path
				d="M11.25 6H15.75"
				stroke="currentColor"
				stroke-width="1.125"
				stroke-linecap="round"
			/>
		</Svg>
	);
};
